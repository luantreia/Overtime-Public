// sitemap.xml dinámico: rutas fijas + cada equipo, jugador, competencia, partido, organización y sede.
const { getJson, origen } = require('./_comun');

const FIJAS = ['/', '/competencias', '/partidos', '/equipos', '/jugadores', '/ranking', '/como-se-juega', '/reglamento', '/lod', '/lod/competencias', '/plaza'];
const ENTIDADES = ['competencias', 'equipos', 'jugadores', 'partidos', 'organizaciones', 'sedes'];

const items = (r) => (Array.isArray(r) ? r : r?.items || r?.data || []);

module.exports = async (req, res) => {
  const base = origen(req);
  const listas = await Promise.all(ENTIDADES.map((e) => getJson(`/${e}?limit=1000`, 25000)));

  const urls = FIJAS.map((p) => `  <url><loc>${base}${p}</loc></url>`);
  ENTIDADES.forEach((e, i) => {
    for (const it of items(listas[i])) {
      if (!it?._id) continue;
      const lastmod = it.updatedAt ? `<lastmod>${String(it.updatedAt).slice(0, 10)}</lastmod>` : '';
      urls.push(`  <url><loc>${base}/${e}/${it._id}</loc>${lastmod}</url>`);
    }
  });

  const completo = listas.every(Boolean);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  // Si Render no respondió, cache corto para reintentar pronto en vez de fijar un sitemap incompleto.
  res.setHeader('Cache-Control', completo ? 'public, s-maxage=21600, stale-while-revalidate=86400' : 'public, s-maxage=300');
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
};
