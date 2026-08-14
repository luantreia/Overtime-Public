import React, { useEffect, useRef, useState } from 'react';
import { extraerYoutubeId, youtubeFondoEmbedUrl, youtubeThumbnailUrl } from '../../utils/youtube';

export interface VideoFondoYoutubeProps {
  /** URL de YouTube en cualquier formato (watch, youtu.be, shorts, embed) o el ID pelado. */
  url?: string | null;
  /** Ancho mínimo de viewport en px a partir del cual se monta el player. */
  minAnchoParaVideo?: number;
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
 * 2. **En mobile no se monta el player.** El iframe de YouTube arrastra ~1 MB de JS y varios MB
 *    de video; en un celular con datos, para un hincha que entró a ver un fixture, no lo vale.
 *    Ahí queda la miniatura, que es una sola imagen. Lo mismo si el sistema pide menos
 *    movimiento (`prefers-reduced-motion`).
 * 3. **El video no debe ser interactivo.** Es decoración: no recibe clicks ni foco, para que no
 *    se coma los botones del header ni aparezca en la navegación por teclado.
 */
const VideoFondoYoutube: React.FC<VideoFondoYoutubeProps> = ({
  url,
  minAnchoParaVideo = 640,
  className = '',
}) => {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [medidas, setMedidas] = useState<{ ancho: number; alto: number } | null>(null);
  const [montarVideo, setMontarVideo] = useState(false);
  const [videoListo, setVideoListo] = useState(false);

  const videoId = extraerYoutubeId(url);

  // ¿Corresponde montar el player en este dispositivo?
  useEffect(() => {
    if (!videoId || typeof window === 'undefined' || !window.matchMedia) return;

    const ancho = window.matchMedia(`(min-width: ${minAnchoParaVideo}px)`);
    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
    const evaluar = () => setMontarVideo(ancho.matches && !menosMovimiento.matches);

    evaluar();
    // Safari viejo no tiene addEventListener en MediaQueryList.
    const suscribir = (mq: MediaQueryList) => {
      if (mq.addEventListener) {
        mq.addEventListener('change', evaluar);
        return () => mq.removeEventListener('change', evaluar);
      }
      mq.addListener(evaluar);
      return () => mq.removeListener(evaluar);
    };
    const bajas = [suscribir(ancho), suscribir(menosMovimiento)];
    return () => bajas.forEach((baja) => baja());
  }, [videoId, minAnchoParaVideo]);

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
      <img
        src={youtubeThumbnailUrl(videoId)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      {montarVideo && medidas && (
        <iframe
          title=""
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
