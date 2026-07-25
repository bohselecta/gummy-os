import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createApiHandler, securityHeaders } from '../server/api.mjs';

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const production = process.env.NODE_ENV === 'production';
const root = process.cwd();
const types = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.webmanifest', 'application/manifest+json']
]);
const api = createApiHandler();
const vite = production ? null : await (await import('vite')).createServer({
  server: { middlewareMode: true },
  appType: 'spa'
});

async function serveProduction(request, response) {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const safePath = normalize(relative).replace(/^(\.\.(\/|\\|$))+/, '');
  let filePath = join(root, 'build', safePath);
  let info = await stat(filePath).catch(() => null);
  if (!info && !extname(filePath)) {
    filePath = join(root, 'build', 'index.html');
    info = await stat(filePath).catch(() => null);
  }
  if (!info) return false;
  if (info.isDirectory()) filePath = join(filePath, 'index.html');
  const body = await readFile(filePath);
  response.writeHead(200, { ...securityHeaders(), 'content-type': types.get(extname(filePath)) || 'application/octet-stream', 'cache-control': filePath.endsWith('index.html') ? 'no-store' : 'public, max-age=3600' });
  response.end(body);
  return true;
}

const server = createServer(async (request, response) => {
  try {
    if (request.url.startsWith('/api/')) return void await api(request, response);
    if (vite) {
      for (const [name, value] of Object.entries(securityHeaders({ development: true }))) response.setHeader(name, value);
      return void vite.middlewares(request, response, error => {
        if (error) {
          response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
          response.end('Development server error');
        }
      });
    }
    if (await serveProduction(request, response)) return;
    response.writeHead(404, { ...securityHeaders(), 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', event: 'server_error', message: error.message }));
    if (!response.headersSent) response.writeHead(500, { ...securityHeaders(), 'content-type': 'application/json' });
    response.end(JSON.stringify({ status: 'failed', message: 'Server request failed.' }));
  }
});

server.listen(port, host, () => {
  console.log(`Gummy is open at http://${host}:${port}`);
});
