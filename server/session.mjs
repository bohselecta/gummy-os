import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const secret = process.env.GUMMY_SESSION_SECRET || (process.env.GUMMY_TEST_MODE === '1' ? 'test-only-gummy-session-secret' : randomBytes(32).toString('hex'));

function signature(value) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function seal(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${signature(encoded)}`;
}

export function unseal(value) {
  if (!value) return null;
  const [encoded, supplied] = value.split('.');
  if (!encoded || !supplied) return null;
  const expected = signature(encoded);
  if (expected.length !== supplied.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    return Date.parse(payload.expiresAt) > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || '').split(';').map(value => value.trim()).filter(Boolean).map(value => {
    const index = value.indexOf('=');
    return [value.slice(0, index), decodeURIComponent(value.slice(index + 1))];
  }));
}

export function sessionFrom(request) {
  return unseal(parseCookies(request).gummy_session);
}

export function sessionCookie(payload) {
  const secure = process.env.GUMMY_PUBLIC_ORIGIN?.startsWith('https://');
  return `gummy_session=${encodeURIComponent(seal(payload))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600${secure ? '; Secure' : ''}`;
}

export function newSession(extra = {}) {
  return { id: randomBytes(16).toString('hex'), csrf: randomBytes(24).toString('base64url'), expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), ...extra };
}
