import React from 'react';
import { extraerYoutubeId, youtubePartidoEmbedUrl } from '../../utils/youtube';

export interface VideoPartidoProps {
  /** URL de YouTube en cualquier formato (watch, youtu.be, shorts, embed, live) o el ID pelado. */
  url?: string | null;
  className?: string;
}

/**
 * Reproductor del video del partido (en vivo o ya finalizado). A diferencia de
 * `VideoFondoYoutube`, este es interactivo: tiene controles y no hace autoplay/loop.
 */
const VideoPartido: React.FC<VideoPartidoProps> = ({ url, className = '' }) => {
  const videoId = extraerYoutubeId(url);
  if (!videoId) return null;

  return (
    <div className={`aspect-video w-full overflow-hidden rounded-lg bg-black ${className}`}>
      <iframe
        title="Video del partido"
        src={youtubePartidoEmbedUrl(videoId)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="h-full w-full border-0"
      />
    </div>
  );
};

export default VideoPartido;
