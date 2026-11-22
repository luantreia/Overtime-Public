// Compartido por las funciones de Vercel de SEO. El "_" inicial evita que Vercel lo exponga como endpoint.

const API = process.env.SEO_API_URL || 'https://overtime-ddyl.onrender.com/api';

// Render (plan free) puede tardar en despertar: si no responde a tiempo, servimos el HTML genérico.
async function getJson(path, timeoutMs = 4000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(API + path, { signal: ctrl.signal });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function origen(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`;
}

module.exports = { getJson, origen };
