import React, { useEffect, useRef, useState } from 'react';
import { extraerYoutubeId, youtubeFondoEmbedUrl, youtubeThumbnailUrls } from '../../utils/youtube';

export interface VideoFondoYoutubeProps {
  /** URL de YouTube en cualquier formato (watch, youtu.be, shorts, embed) o el ID pelado. */
  url?: string | null;
  className?: string;
}

/**
 * Fondo decorativo de video de YouTube.
 *
 * Tres cosas que no son obvias y por las que este componente existe:
 *
 * 1. **Un iframe no tiene `object-fit: cover`.** El player siempre mantiene 16:9, así que para
 *    llenar una franja ancha y baja hay que medir el contenedor y agrandar el iframe a mano
 *    hasta que tape, recortando por el lado que sobra. Se hace con ResizeObserver en vez de
 *    unidades de viewport porque el header vive dentro de un contenedor con ancho máximo.
 * 2. **La miniatura queda abajo como red.** Se ve mientras el player carga, y es lo único que
 *    queda si el navegador bloquea el autoplay (típico de los modos de ahorro de datos). El
 *    player no se monta si el sistema pide menos movimiento (`prefers-reduced-motion`).
 * 3. **El video no debe ser interactivo.** Es decoración: no recibe clicks ni foco, para que no
 *    se coma los botones del header ni aparezca en la navegación por teclado.
 */
const VideoFondoYoutube: React.FC<VideoFondoYoutubeProps> = ({ url, className = '' }) => {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [medidas, setMedidas] = useState<{ ancho: number; alto: number } | null>(null);
  const [montarVideo, setMontarVideo] = useState(false);
  const [videoListo, setVideoListo] = useState(false);
  const [miniatura, setMiniatura] = useState(0);

  const videoId = extraerYoutubeId(url);
  const miniaturas = videoId ? youtubeThumbnailUrls(videoId) : [];

  // El video va en todos los tamaños; sólo lo salteamos si el sistema pide menos movimiento.
  useEffect(() => {
    if (!videoId || typeof window === 'undefined' || !window.matchMedia) return;

    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
    const evaluar = () => setMontarVideo(!menosMovimiento.matches);
    evaluar();

    // Safari viejo no tiene addEventListener en MediaQueryList.
    if (menosMovimiento.addEventListener) {
      menosMovimiento.addEventListener('change', evaluar);
      return () => menosMovimiento.removeEventListener('change', evaluar);
    }
    menosMovimiento.addListener(evaluar);
    return () => menosMovimiento.removeListener(evaluar);
  }, [videoId]);

  // Escalar el iframe para que cubra el contenedor manteniendo 16:9.
  useEffect(() => {
    const el = contenedorRef.current;
    if (!el || !montarVideo || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect;
      if (!width || !height) return;
      const escala = Math.max(width / 16, height / 9);
      setMedidas({ ancho: escala * 16, alto: escala * 9 });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [montarVideo]);

  if (!videoId) return null;

  return (
    <div
      ref={contenedorRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {miniatura < miniaturas.length && (
        <img
          src={miniaturas[miniatura]}
          alt=""
          // maxresdefault no existe para todos los videos: si tira 404, bajamos un escalón.
          onError={() => setMiniatura((i) => i + 1)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {montarVideo && medidas && (
        <iframe
          // El contenedor es aria-hidden, así que este título no se anuncia; va porque
          // jsx-a11y/iframe-has-title lo exige y CRA trata los warnings como error en CI.
          title="Video de fondo de la organización"
          tabIndex={-1}
          src={youtubeFondoEmbedUrl(videoId)}
          allow="autoplay; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setVideoListo(true)}
          style={{ width: medidas.ancho, height: medidas.alto }}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-700 ${
            videoListo ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

export default VideoFondoYoutube;
