// Dynamic rendering para bots (buscadores y vistas previas de WhatsApp/Twitter/Discord...).
// vercel.json manda acá las páginas de detalle SOLO cuando el user-agent es un bot; los usuarios
// reciben la SPA normal. Devuelve el mismo index.html con título, meta, JSON-LD y contenido real
// del equipo/jugador/etc., para que no dependa de ejecutar JavaScript.
const { getJson, origen } = require('./_comun');

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const resumir = (t, max = 160) => {
  const s = String(t || '').replace(/\s+/g, ' ').trim();
  return s.length <= max ? s : s.slice(0, s.lastIndexOf(' ', max - 1)) + '…';
};

// Cada tipo: endpoint de la API y cómo convertir la respuesta en meta.
// Mantener alineado con usePageTitle en las páginas de detalle de src/features.
const TIPOS = {
  equipos: (e) => ({
    titulo: e.nombre,
    descripcion: e.descripcion || `${e.nombre}: equipo de dodgeball${e.pais ? ` de ${e.pais}` : ''}. Plantel, partidos, resultados y estadísticas.`,
    imagen: e.escudo || e.foto,
    jsonLd: {
      '@type': 'SportsTeam', name: e.nombre, sport: 'Dodgeball', logo: e.escudo,
      url: e.sitioWeb || undefined, sameAs: Object.values(e.redesSociales || {}).filter(Boolean),
    },
  }),
  jugadores: (j) => ({
    titulo: j.nombre,
    descripcion: `${j.nombre}${j.alias ? ` (${j.alias})` : ''}: jugador de dodgeball${j.nacionalidad ? ` de ${j.nacionalidad}` : ''}. Equipos, partidos y estadísticas individuales.`,
    imagen: j.foto,
    jsonLd: { '@type': 'Person', name: j.nombre, alternateName: j.alias || undefined, nationality: j.nacionalidad || undefined, image: j.foto },
  }),
  competencias: (c) => ({
    titulo: c.nombre,
    descripcion: c.descripcion ||
      `${c.nombre}: ${c.tipo || 'competencia'} de dodgeball ${c.modalidad || ''} ${c.categoria || ''}${c.organizacion?.nombre ? ` organizado por ${c.organizacion.nombre}` : ''}. Fixture, resultados, posiciones y estadísticas.`,
    imagen: c.foto,
    jsonLd: {
      '@type': 'SportsEvent', name: c.nombre, sport: 'Dodgeball', startDate: c.fechaInicio, endDate: c.fechaFin, image: c.foto,
      organizer: c.organizacion?.nombre ? { '@type': 'Organization', name: c.organizacion.nombre } : undefined,
    },
  }),
  partidos: (p) => {
    const local = p.equipoLocal?.nombre;
    const visitante = p.equipoVisitante?.nombre;
    const titulo = p.nombre || (local && visitante ? `${local} vs ${visitante}` : 'Partido');
    return {
      titulo,
      descripcion: p.estado === 'finalizado'
        ? `${local || 'Local'} ${p.marcadorLocal ?? 0} - ${p.marcadorVisitante ?? 0} ${visitante || 'Visitante'}: resultado, sets y estadísticas del partido de dodgeball.`
        : `${titulo}: partido de dodgeball. Horario, resultado en vivo y estadísticas.`,
      imagen: p.equipoLocal?.escudo,
      jsonLd: {
        '@type': 'SportsEvent', name: titulo, sport: 'Dodgeball', startDate: p.fecha,
        homeTeam: local ? { '@type': 'SportsTeam', name: local } : undefined,
        awayTeam: visitante ? { '@type': 'SportsTeam', name: visitante } : undefined,
      },
    };
  },
  organizaciones: (o) => ({
    titulo: o.nombre,
    descripcion: o.descripcion || `${o.nombre}: organización de dodgeball. Ligas, torneos y competencias que organiza.`,
    imagen: o.logo,
    jsonLd: { '@type': 'SportsOrganization', name: o.nombre, sport: 'Dodgeball', logo: o.logo, url: o.sitioWeb || undefined },
  }),
  sedes: (s) => ({
    titulo: s.nombre,
    descripcion: `${s.nombre}: sede de dodgeball. Partidos y competencias que se juegan en esta sede.`,
  }),
};

function setMeta(html, attr, key, value) {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

module.exports = async (req, res) => {
  const { tipo, id } = req.query;
  const base = origen(req);
  const htmlRes = await fetch(`${base}/index.html`);
  let html = await htmlRes.text();

  const armar = TIPOS[tipo];
  const dato = armar && /^[a-f0-9]{24}$/i.test(String(id)) ? await getJson(`/${tipo}/${id}`) : null;

  if (dato) {
    const m = armar(dato);
    const titulo = `${m.titulo} | Overtime Dodgeball`;
    const descripcion = resumir(m.descripcion);
    const url = `${base}/${tipo}/${id}`;

    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(titulo)}</title>`);
    html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${esc(url)}" />`);
    html = setMeta(html, 'name', 'description', descripcion);
    html = setMeta(html, 'property', 'og:title', titulo);
    html = setMeta(html, 'property', 'og:description', descripcion);
    html = setMeta(html, 'property', 'og:url', url);
    html = setMeta(html, 'name', 'twitter:title', titulo);
    html = setMeta(html, 'name', 'twitter:description', descripcion);
    if (m.imagen) {
      html = setMeta(html, 'property', 'og:image', m.imagen);
      html = setMeta(html, 'name', 'twitter:image', m.imagen);
    }
    const jsonLd = JSON.stringify({ '@context': 'https://schema.org', ...m.jsonLd, url }).replace(/</g, '\\u003c');
    html = html.replace('</head>', `    <script type="application/ld+json">${jsonLd}</script>\n  </head>`);
    html = html.replace(
      /<main([^>]*)>[\s\S]*?<\/main>/,
      `<main$1><h1>${esc(m.titulo)}</h1><p>${esc(m.descripcion)}</p>` +
        `<p><a href="/${tipo}">Ver más ${esc(tipo)}</a> · <a href="/">Overtime Dodgeball</a></p></main>`,
    );
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Cache en el CDN de Vercel: los bots no esperan a Render en cada visita.
  res.setHeader('Cache-Control', dato ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'public, s-maxage=60');
  res.status(200).send(html);
};
