// Vercel Edge Middleware — serves pre-rendered OG/Twitter meta tags to link-preview
// bots (WhatsApp, Telegram, Facebook, etc.) for entity detail pages. These bots fetch
// raw HTML without executing JS, so the CRA SPA's client-side title/meta updates never
// reach them; this intercepts the request before it and swaps in the real values.
import { next } from '@vercel/edge';

export const config = {
  matcher: ['/jugadores/:id', '/equipos/:id', '/partidos/:id'],
};

const BOT_UA_REGEX =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|TelegramBot|Slackbot|LinkedInBot|Discordbot|SkypeUriPreview|Googlebot|Pinterest|redditbot/i;

const API_BASE_URL = process.env.API_BASE_URL || 'https://overtime-ddyl.onrender.com/api';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

type MetaData = { title: string; description: string; image?: string };

async function fetchMeta(tipo: string, id: string): Promise<MetaData | null> {
  try {
    if (tipo === 'jugadores') {
      const res = await fetch(`${API_BASE_URL}/jugadores/${id}`);
      if (!res.ok) return null;
      const j = await res.json();
      return {
        title: j.alias ? `${j.nombre} (${j.alias}) — Overtime Dodgeball` : `${j.nombre} — Overtime Dodgeball`,
        description: `Perfil de ${j.nombre} en Overtime Dodgeball.`,
        image: j.foto,
      };
    }
    if (tipo === 'equipos') {
      const res = await fetch(`${API_BASE_URL}/equipos/${id}`);
      if (!res.ok) return null;
      const e = await res.json();
      return {
        title: `${e.nombre} — Overtime Dodgeball`,
        description: `Perfil del equipo ${e.nombre} en Overtime Dodgeball.`,
        image: e.escudo,
      };
    }
    if (tipo === 'partidos') {
      const res = await fetch(`${API_BASE_URL}/partidos/${id}`);
      if (!res.ok) return null;
      const p = await res.json();
      const local = p.equipoLocal?.nombre;
      const visitante = p.equipoVisitante?.nombre;
      const titulo = local && visitante ? `${local} vs ${visitante} — Overtime Dodgeball` : 'Partido — Overtime Dodgeball';
      return {
        title: titulo,
        description: `Seguí este partido de Overtime Dodgeball.`,
        image: p.equipoLocal?.escudo,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default async function middleware(request: Request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA_REGEX.test(ua)) {
    return next();
  }

  const url = new URL(request.url);
  const [, tipo, id] = url.pathname.split('/');
  if (!tipo || !id) return next();

  const meta = await fetchMeta(tipo, id);
  if (!meta) return next();

  const indexRes = await fetch(new URL('/index.html', request.url));
  let html = await indexRes.text();

  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const image = meta.image ? escapeHtml(meta.image) : undefined;

  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url.toString()}$2`);

  if (!html.includes('property="og:url"')) {
    html = html.replace(
      '<meta property="og:title"',
      `<meta property="og:url" content="${url.toString()}" />\n    <meta property="og:title"`
    );
  }

  if (image) {
    html = html
      .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
      .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`);
  }

  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
