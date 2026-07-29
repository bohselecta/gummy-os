import { randomUUID } from 'node:crypto';
import { replyToPrivateChat } from './chat.mjs';
import { transformExecution } from './execution.mjs';
import { submitTesterFeedback } from './feedback.mjs';
import { disconnectBox, installUrl, listRepositories, connectBox, syncBox } from './github.mjs';
import { newSession, sessionCookie, sessionFrom } from './session.mjs';

const limits = new Map();

export function securityHeaders({ development = false } = {}) {
  return {
    'content-security-policy': `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' http://127.0.0.1:5214 http://localhost:5214${development ? ' ws:' : ''}; frame-src https:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https://github.com`,
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'permissions-policy': 'camera=(self), display-capture=(self), geolocation=(), microphone=(self)',
    'cross-origin-opener-policy': 'same-origin-allow-popups',
    'x-frame-options': 'DENY'
  };
}

function send(response, status, body, extra = {}) {
  response.writeHead(status, { ...securityHeaders(), 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra });
  response.end(JSON.stringify(body));
}

async function body(request, limit = 400 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Request too large.'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString() || '{}');
  } catch {
    throw Object.assign(new Error('Request body must be valid JSON.'), { status: 400 });
  }
}

function sameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  if (process.env.GUMMY_PUBLIC_ORIGIN) return origin === process.env.GUMMY_PUBLIC_ORIGIN;
  return origin === `http://${request.headers.host}` || origin === `https://${request.headers.host}`;
}

function rateAllowed(request) {
  const key = request.socket.remoteAddress || 'unknown';
  const current = limits.get(key) || { count: 0, reset: Date.now() + 60_000 };
  if (current.reset <= Date.now()) Object.assign(current, { count: 0, reset: Date.now() + 60_000 });
  current.count += 1;
  limits.set(key, current);
  return current.count <= 60;
}

export function createApiHandler() {
  return async (request, response) => {
    const traceId = randomUUID();
    const started = performance.now();
    let status = 200;
    let event = 'api';
    try {
      if (!sameOrigin(request)) return send(response, 403, { status: 'blocked', message: 'Origin rejected.' });
      if (!rateAllowed(request)) return send(response, 429, { status: 'blocked', message: 'Rate limit exceeded.' });
      const url = new URL(request.url, `http://${request.headers.host}`);
      if (request.method === 'GET' && url.pathname === '/api/v1/session') {
        const session = sessionFrom(request) || newSession();
        return send(response, 200, {
          csrf: session.csrf,
          githubConfigured: Boolean(process.env.GITHUB_APP_ID),
          openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
          feedbackConfigured: Boolean(
            process.env.GUMMY_FEEDBACK_REPOSITORY
            && (
              process.env.GUMMY_FEEDBACK_GITHUB_TOKEN
              || (process.env.GITHUB_APP_ID && process.env.GITHUB_APP_PRIVATE_KEY)
            )
          ),
          signalingConfigured: Boolean(process.env.GUMMY_SIGNALING_URL),
          testMode: process.env.GUMMY_TEST_MODE === '1'
        }, { 'set-cookie': sessionCookie(session) });
      }
      let session = sessionFrom(request);
      if (!session) return send(response, 401, { status: 'blocked', message: 'Session required.' });
      const csrfExempt = request.method === 'GET' && ['/api/v1/github/install', '/api/v1/github/setup'].includes(url.pathname);
      if (!csrfExempt && request.headers['x-gummy-csrf'] !== session.csrf) return send(response, 403, { status: 'blocked', message: 'CSRF validation failed.' });
      if (request.method === 'POST' && url.pathname === '/api/v1/executions/transform') {
        event = 'transform';
        const result = await transformExecution(await body(request));
        status = result.code;
        console.log(JSON.stringify({
          traceId,
          event: 'transform_result',
          status: result.body.status,
          durationMs: Math.round(performance.now() - started),
          model: result.body.model,
          tokenUsage: result.body.usage,
          cost: result.body.cost
        }));
        return send(response, result.code, result.body);
      }
      if (request.method === 'POST' && url.pathname === '/api/v1/chat/reply') {
        event = 'private_chat';
        const result = await replyToPrivateChat(await body(request, 512 * 1024), { sessionId: session.id });
        status = result.code;
        console.log(JSON.stringify({
          traceId,
          event: 'private_chat_result',
          status: result.body.status,
          durationMs: Math.round(performance.now() - started),
          model: result.body.model,
          tokenUsage: result.body.usage,
          cost: result.body.cost
        }));
        return send(response, result.code, result.body);
      }
      if (request.method === 'POST' && url.pathname === '/api/v1/tester-feedback') {
        event = 'tester_feedback';
        const result = await submitTesterFeedback(await body(request, 32 * 1024));
        status = result.code;
        return send(response, result.code, result.body);
      }
      if (request.method === 'GET' && url.pathname === '/api/v1/github/install') {
        const target = installUrl(session.csrf);
        if (!target) return send(response, 503, { status: 'blocked', message: 'GitHub App is not configured.' });
        response.writeHead(302, { ...securityHeaders(), location: target, 'cache-control': 'no-store' });
        return response.end();
      }
      if (request.method === 'GET' && url.pathname === '/api/v1/github/setup') {
        if (url.searchParams.get('state') !== session.csrf) return send(response, 403, { status: 'blocked', message: 'GitHub setup state mismatch.' });
        session = { ...session, githubInstallationId: Number(url.searchParams.get('installation_id')) };
        response.writeHead(302, { ...securityHeaders(), location: '/?github=connected', 'set-cookie': sessionCookie(session), 'cache-control': 'no-store' });
        return response.end();
      }
      if (request.method === 'GET' && url.pathname === '/api/v1/github/repositories') return send(response, 200, { repositories: await listRepositories(session) });
      if (request.method === 'POST' && url.pathname === '/api/v1/github/boxes/connect') return send(response, 200, await connectBox(session, await body(request, 64 * 1024)));
      const syncMatch = url.pathname.match(/^\/api\/v1\/github\/boxes\/([^/]+)\/sync$/);
      if (request.method === 'POST' && syncMatch) return send(response, 200, await syncBox(session, decodeURIComponent(syncMatch[1]), await body(request, 1024 * 1024)));
      const deleteMatch = url.pathname.match(/^\/api\/v1\/github\/boxes\/([^/]+)\/connection$/);
      if (request.method === 'DELETE' && deleteMatch) return send(response, 200, disconnectBox(decodeURIComponent(deleteMatch[1])));
      status = 404;
      return send(response, 404, { status: 'failed', message: 'Endpoint not found.' });
    } catch (error) {
      status = error.status || 500;
      return send(response, status, { status: status === 500 ? 'failed' : 'blocked', message: status === 500 ? 'Request failed.' : error.message });
    } finally {
      console.log(JSON.stringify({ traceId, event, status, durationMs: Math.round(performance.now() - started) }));
    }
  };
}
