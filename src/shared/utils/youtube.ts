/**
 * Extrae el ID de un video de YouTube desde cualquiera de las formas en que la gente
 * copia un link: watch?v=, youtu.be/, /shorts/, /embed/, /live/ o el ID pelado.
 *
 * Devuelve null si no reconoce nada, para que el que llama pueda caer al fondo sólido
 * en vez de armar un iframe roto.
 */
export const extraerYoutubeId = (input?: string | null): string | null => {
  if (!input) return null;
  const texto = input.trim();
  if (!texto) return null;

  // El ID pelado: 11 caracteres del alfabeto de YouTube.
  if (/^[\w-]{11}$/.test(texto)) return texto;

  let url: URL;
  try {
    url = new URL(texto.startsWith('http') ? texto : `https://${texto}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return /^[\w-]{11}$/.test(id) ? id : null;
  }

  if (!/(^|\.)youtube(-nocookie)?\.com$/.test(host)) return null;

  const v = url.searchParams.get('v');
  if (v && /^[\w-]{11}$/.test(v)) return v;

  const match = url.pathname.match(/\/(?:embed|shorts|live|v)\/([\w-]{11})/);
  return match ? match[1] : null;
};

/**
 * URL de embed para usar el video como fondo decorativo: silenciado, en loop y sin
 * controles ni sugerencias al final. El `playlist=<id>` no es redundante — es la única
 * forma de que `loop=1` funcione en un video suelto.
 *
 * Usamos youtube-nocookie.com para no plantar cookies de tracking en los hinchas que
 * solo entran a ver un fixture.
 */
export const youtubeFondoEmbedUrl = (id: string): string => {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: id,
    controls: '0',
    disablekb: '1',
    fs: '0',
    modestbranding: '1',
    playsinline: '1',
    rel: '0',
    iv_load_policy: '3',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
};

/**
 * Miniaturas del video, de mejor a peor calidad, para usar de poster mientras el player carga.
 *
 * `maxresdefault` no existe para todos los videos (los subidos en baja nunca la tienen) y
 * devuelve 404, así que hay que tener a mano el siguiente escalón: `hqdefault` sí está
 * siempre.
 */
export const youtubeThumbnailUrls = (id: string): string[] => [
  `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
];
