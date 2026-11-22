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

// Listados para bots: HTML con un link por entidad, así el buscador ve (y sigue) el contenido real.
const LISTADOS = {
  equipos: {
    titulo: 'Equipos de dodgeball',
    descripcion: (n) => `${n} equipos de dodgeball registrados en Overtime: clubes y selecciones con plantel, partidos y estadísticas.`,
    item: (e) => [e.nombre, [e.esSeleccionNacional ? 'Selección nacional' : e.tipo === 'club' ? 'Club' : e.tipo, e.pais].filter(Boolean).join(' · ')],
  },
  competencias: {
    titulo: 'Competencias de dodgeball',
    descripcion: (n) => `${n} ligas y torneos de dodgeball en Overtime: fixture, resultados, posiciones y estadísticas.`,
    item: (c) => [c.nombre, [c.modalidad, c.categoria, c.organizacion?.nombre].filter(Boolean).join(' · ')],
  },
  jugadores: {
    titulo: 'Jugadores de dodgeball',
    descripcion: (n) => `${n} jugadores de dodgeball en Overtime: equipos, partidos y estadísticas individuales.`,
    item: (j) => [j.nombre + (j.alias ? ` (${j.alias})` : ''), j.nacionalidad || ''],
  },
};

const items = (r) => (Array.isArray(r) ? r : r?.items || r?.data || []);

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

  if (!id && tipo === 'ranking') return ranking(res, base, html);
  if (!id && LISTADOS[tipo]) return listado(req, res, tipo, base, html);

  const armar = TIPOS[tipo];
  const dato = armar && /^[a-f0-9]{24}$/i.test(String(id)) ? await getJson(`/${tipo}/${id}`) : null;

  if (dato) {
    const m = armar(dato);
    const titulo = `${m.titulo} | Overtime Dodgeball`;
    const descripcion = resumir(m.descripcion);
    const url = `${base}/${tipo}/${id}`;

    html = aplicarMeta(html, titulo, descripcion, url, m.jsonLd);
    if (m.imagen) {
      html = setMeta(html, 'property', 'og:image', m.imagen);
      html = setMeta(html, 'name', 'twitter:image', m.imagen);
    }
    html = html.replace(
      /<main([^>]*)>[\s\S]*?<\/main>/,
      `<main$1><h1>${esc(m.titulo)}</h1><p>${esc(m.descripcion)}</p>` +
        `<p><a href="/${tipo}">Ver más ${esc(tipo)}</a> · <a href="/">Overtime Dodgeball</a></p></main>`,
    );
  }

  enviar(res, html, Boolean(dato));
};

function enviar(res, html, ok) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Cache en el CDN de Vercel: los bots no esperan a Render en cada visita.
  res.setHeader('Cache-Control', ok ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'public, s-maxage=60');
  res.status(200).send(html);
}

function aplicarMeta(html, titulo, descripcion, url, jsonLd) {
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(titulo)}</title>`);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${esc(url)}" />`);
  html = setMeta(html, 'name', 'description', descripcion);
  html = setMeta(html, 'property', 'og:title', titulo);
  html = setMeta(html, 'property', 'og:description', descripcion);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:title', titulo);
  html = setMeta(html, 'name', 'twitter:description', descripcion);
  const ld = JSON.stringify({ '@context': 'https://schema.org', ...jsonLd, url }).replace(/</g, '\\u003c');
  return html.replace('</head>', `    <script type="application/ld+json">${ld}</script>\n  </head>`);
}

// /ranking para bots: mismas tablas que RankingGlobalPage (categoría Libre, la que abre por defecto).
const RANKING_MODALIDADES = ['Foam', 'Cloth'];
const RANKING_TOP = 50;

async function ranking(res, base, html) {
  const tablas = await Promise.all(RANKING_MODALIDADES.map(async (modalidad) => ({
    modalidad,
    filas: items(await getJson(`/ranked/leaderboard?modalidad=${modalidad}&categoria=Libre&minMatches=1&limit=${RANKING_TOP}`))
      .filter((f) => f?.playerId && f.playerName),
  })));
  const hayDatos = tablas.some((t) => t.filas.length);
  const h1 = 'Ranking ELO de dodgeball';
  const descripcion = 'Ranking ELO de jugadores de dodgeball en foam y cloth: rating, partidos jugados, victorias y derrotas según los partidos rankeados.';

  html = aplicarMeta(html, `${h1} | Overtime Dodgeball`, descripcion, `${base}/ranking`, {
    '@type': 'CollectionPage', name: h1,
    hasPart: tablas.filter((t) => t.filas.length).map((t) => ({
      '@type': 'ItemList', name: `Ranking ${t.modalidad}`, numberOfItems: t.filas.length,
      itemListElement: t.filas.map((f, i) => ({ '@type': 'ListItem', position: i + 1, name: f.playerName, url: `${base}/jugadores/${f.playerId}` })),
    })),
  });

  const num = (n) => (Number.isFinite(Number(n)) ? Math.round(Number(n)) : '—');
  const secciones = tablas.map(({ modalidad, filas }) => {
    if (!filas.length) return `<h2>Ranking ${modalidad}</h2><p>Todavía no hay jugadores rankeados en ${modalidad}.</p>`;
    const trs = filas.map((f, i) =>
      `<tr><td>${i + 1}</td><td><a href="/jugadores/${esc(f.playerId)}">${esc(f.playerName)}</a></td>` +
      `<td>${num(f.rating)}</td><td>${num(f.matchesPlayed)}</td><td>${num(f.wins ?? 0)}-${num(f.draws ?? 0)}-${num(f.losses ?? 0)}</td></tr>`).join('');
    return `<h2>Ranking ${modalidad}</h2><table><caption>Top ${filas.length} ${modalidad}, categoría libre</caption>` +
      `<thead><tr><th scope="col">Pos.</th><th scope="col">Jugador</th><th scope="col">ELO</th><th scope="col">PJ</th><th scope="col">V-E-D</th></tr></thead><tbody>${trs}</tbody></table>`;
  }).join('');

  html = html.replace(/<main([^>]*)>[\s\S]*?<\/main>/,
    `<main$1><h1>${h1}</h1><p>${descripcion} Cada partido rankeado suma o resta puntos según el rating del rival; el ranking se separa por modalidad y categoría.</p>` +
    `${secciones}<p><a href="/jugadores">Jugadores</a> · <a href="/competencias">Competencias</a> · <a href="/">Overtime Dodgeball</a></p></main>`);

  // Sin datos (Render dormido) igual mandamos h1/canonical propios, con cache corto para reintentar.
  enviar(res, html, hayDatos);
}

async function listado(req, res, tipo, base, html) {
  const L = LISTADOS[tipo];
  const lista = items(await getJson(`/${tipo}?limit=1000`)).filter((x) => x?._id && x.nombre)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  if (lista.length) {
    const titulo = `${L.titulo} | Overtime Dodgeball`;
    const url = `${base}/${tipo}`;
    html = aplicarMeta(html, titulo, L.descripcion(lista.length), url, {
      '@type': 'CollectionPage', name: L.titulo,
      mainEntity: { '@type': 'ItemList', numberOfItems: lista.length,
        itemListElement: lista.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.nombre, url: `${base}/${tipo}/${x._id}` })) },
    });
    const lis = lista.map((x) => {
      const [nombre, detalle] = L.item(x);
      return `<li><a href="/${tipo}/${x._id}">${esc(nombre)}</a>${detalle ? ` — ${esc(detalle)}` : ''}</li>`;
    }).join('');
    html = html.replace(/<main([^>]*)>[\s\S]*?<\/main>/,
      `<main$1><h1>${esc(L.titulo)}</h1><p>${esc(L.descripcion(lista.length))}</p><ul>${lis}</ul><p><a href="/">Overtime Dodgeball</a></p></main>`);
  }
  enviar(res, html, lista.length > 0);
}
