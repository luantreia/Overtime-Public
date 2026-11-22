import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SedeMapProps {
  lat: number;
  lng: number;
  nombre?: string;
  className?: string;
}

/**
 * El mapa es una imagen estática (sin arrastre ni zoom con gestos), así que no lo dejamos entrar
 * en el orden de Tab: Leaflet hacía foco en el contenedor y en el marcador sin que eso sirviera de
 * nada. Lo útil para todos, y lo único accesible por teclado, es el link "Cómo llegar".
 */
const SedeMap: React.FC<SedeMapProps> = ({ lat, lng, nombre, className }) => {
  const comoLlegar = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  return (
    <div className={className}>
    <div
      className="h-40 sm:h-56 rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0"
    >
      <MapContainer
        keyboard={false}
        zoomControl={false}
        center={[lat, lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} keyboard={false}>
          {nombre && <Popup>{nombre}</Popup>}
        </Marker>
      </MapContainer>
    </div>
      <a
        href={comoLlegar}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 rounded text-sm font-semibold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        Cómo llegar<span aria-hidden="true"> ↗</span>
        <span className="sr-only"> (se abre en Google Maps, en una pestaña nueva)</span>
      </a>
    </div>
  );
};

export default SedeMap;
