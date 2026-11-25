import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { SedeService, type Sede } from '../services/sedeService';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';

// Mismo fix de íconos que SedeMap.
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AMBA: [number, number] = [-34.62, -58.45];

const conUbicacion = (s: Sede): s is Sede & { coordenadas: { lat: number; lng: number } } =>
  typeof s.coordenadas?.lat === 'number' && typeof s.coordenadas?.lng === 'number';

const fechaValue = (p: Partido): number => {
  const iso = p.fecha && p.hora ? `${p.fecha}T${p.hora}` : p.fecha;
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? d.getTime() : Number.POSITIVE_INFINITY;
};

const formatoFecha = (p: Partido) => {
  const t = fechaValue(p);
  if (!Number.isFinite(t)) return 'Fecha a confirmar';
  return new Date(t).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) + (p.hora ? ` · ${p.hora}` : '');
};

/**
 * Dónde se juega: todas las sedes en un mapa + lista. La lista es la vista principal
 * (accesible por teclado y la más usada en celular); el mapa la acompaña.
 * Las sedes sin coordenadas aparecen en la lista aunque no estén en el mapa.
 */
const SedesMapa: React.FC = () => {
  usePageTitle('Dónde se juega', {
    description: 'Mapa de sedes de dodgeball: clubes, polideportivos y canchas donde se juega, con los próximos partidos de cada una.',
  });
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');

  const { data: sedes = [], isLoading, error } = useQuery({
    queryKey: ['sedes'],
    queryFn: () => SedeService.getAll(),
  });

  const { data: partidos = [] } = useQuery({
    queryKey: ['partidos', { estado: 'programado' }],
    queryFn: () => PartidoService.getAll({ estado: 'programado' }),
  });

  const proximoPorSede = useMemo(() => {
    const m = new Map<string, Partido>();
    const ahora = Date.now() - 3 * 60 * 60 * 1000;
    for (const p of partidos as Partido[]) {
      const sid = p.sede?._id;
      const t = fechaValue(p);
      if (!sid || (Number.isFinite(t) && t < ahora)) continue;
      const actual = m.get(sid);
      if (!actual || t < fechaValue(actual)) m.set(sid, p);
    }
    return m;
  }, [partidos]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return [...sedes]
      .filter(s => !q || `${s.nombre} ${s.direccion ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => {
        const pa = proximoPorSede.has(a.id) ? 0 : 1;
        const pb = proximoPorSede.has(b.id) ? 0 : 1;
        return pa - pb || a.nombre.localeCompare(b.nombre, 'es');
      });
  }, [sedes, busqueda, proximoPorSede]);

  const enMapa = filtradas.filter(conUbicacion);

  return (
    <div className="min-h-dvh bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Dónde se juega</h1>
          <p className="mt-1 text-slate-600">
            Clubes, polideportivos y canchas con dodgeball. Tocá una sede para ver sus próximos partidos.
          </p>
        </header>

        {isLoading ? (
          <p className="text-slate-500">Cargando sedes...</p>
        ) : error ? (
          <p className="text-red-600">No se pudieron cargar las sedes.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="h-72 overflow-hidden rounded-2xl border border-slate-200 shadow-card sm:h-96 lg:sticky lg:top-24 lg:h-[calc(100dvh-8rem)] z-0">
              <MapContainer
                center={enMapa.length ? [enMapa[0].coordenadas.lat, enMapa[0].coordenadas.lng] : AMBA}
                bounds={enMapa.length > 1 ? L.latLngBounds(enMapa.map(s => [s.coordenadas.lat, s.coordenadas.lng])).pad(0.15) : undefined}
                zoom={11}
                scrollWheelZoom={false}
                keyboard={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {enMapa.map(s => {
                  const prox = proximoPorSede.get(s.id);
                  return (
                    <Marker key={s.id} position={[s.coordenadas.lat, s.coordenadas.lng]} keyboard={false}>
                      <Popup>
                        <p className="font-semibold">{s.nombre}</p>
                        {prox && <p className="text-xs">Próximo partido: {formatoFecha(prox)}</p>}
                        <button type="button" onClick={() => navigate(`/sedes/${s.id}`)} className="mt-1 text-sm font-semibold text-brand-600 hover:underline">
                          Ver sede
                        </button>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            <section aria-labelledby="lista-sedes">
              <h2 id="lista-sedes" className="sr-only">Lista de sedes</h2>
              <input
                type="search"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar sede o zona..."
                aria-label="Buscar sede"
                className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <p className="mb-3 text-xs text-muted" aria-live="polite">
                {filtradas.length} sedes · {enMapa.length} en el mapa
              </p>
              <ul className="space-y-2">
                {filtradas.map(s => {
                  const prox = proximoPorSede.get(s.id);
                  return (
                    <li key={s.id}>
                      <Link
                        to={`/sedes/${s.id}`}
                        className="block rounded-xl border border-slate-200 bg-white p-3 hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        <span className="block font-semibold text-slate-900">{s.nombre}</span>
                        {s.direccion && s.direccion !== 'Buenos Aires' && (
                          <span className="block text-sm text-slate-600">{s.direccion}</span>
                        )}
                        <span className="mt-1 block text-xs text-slate-500">
                          {prox ? <span className="font-semibold text-brand-700">Próximo: {formatoFecha(prox)}</span> : 'Sin partidos programados'}
                          {!conUbicacion(s) && ' · ubicación sin cargar'}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default SedesMapa;
