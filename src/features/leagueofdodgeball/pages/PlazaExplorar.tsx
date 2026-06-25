import React, { useEffect, useState } from 'react';
import { PlazaService } from '../services/plazaService';
import { Lobby } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';
import { MapPinIcon, CalendarIcon, UsersIcon, TrophyIcon, ListBulletIcon, MapIcon, InformationCircleIcon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
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

const PlazaExplorar: React.FC = () => {
  const navigate = useNavigate();
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showInfo, setShowInfo] = useState(false);
  useEffect(() => {
    // Attempt to get user location for better results
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          console.log('Location access denied');
          // Default to a central point if denied
          setLocation({ lat: -34.6037, lng: -58.3816 });
        },
        { timeout: 10000 }
      );
    } else {
      setLocation({ lat: -34.6037, lng: -58.3816 });
    }
  }, []);

  useEffect(() => {
    const fetchLobbies = async () => {
      try {
        setLoading(true);
        const data = await PlazaService.getLobbies(
          location?.lat,
          location?.lng,
          20 // 20km radius default
        );
        setLobbies(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchLobbies();
    }
  }, [location]);


  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Modal de ayuda */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowInfo(false)}>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">¿Cómo funciona La Plaza?</h2>
                <p className="text-xs text-slate-500 mt-0.5">Dodgeball callejero rankeado</p>
              </div>
              <button onClick={() => setShowInfo(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Flujo */}
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">El flujo de un partido</h3>
                <ol className="space-y-3">
                  {[
                    { n: '1', title: 'Creá o unite a un lobby', desc: 'El host crea el lobby con fecha, lugar y modalidad. Cualquier jugador con perfil puede unirse.' },
                    { n: '2', title: 'Check-in GPS', desc: 'Cuando llegás a la cancha, validás tu presencia con GPS. Tenés que estar a menos de 150m del lugar.' },
                    { n: '3', title: 'Equilibrio de equipos', desc: 'El host puede usar "Auto-Equilibrar" para balancear los teams por ELO automáticamente.' },
                    { n: '4', title: 'Jugá el partido', desc: 'El host o el Oficial registran los sets en tiempo real desde el panel de control.' },
                    { n: '5', title: 'Confirmá el resultado', desc: 'El host y el capitán rival deben confirmar el marcador. Si hay desacuerdo, se puede corregir antes.' },
                    { n: '6', title: 'Karma post-partido', desc: 'Votás la conducta de cada jugador. Esos votos afectan el Karma de todos.' },
                  ].map(step => (
                    <li key={step.n} className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center">{step.n}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{step.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Ranking */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <TrophyIcon className="h-4 w-4" /> Puntos de ranking
                </h3>
                <div className="flex gap-3">
                  <div className="flex-1 rounded-lg bg-white border border-slate-200 p-3 text-center">
                    <p className="text-2xl font-black text-slate-700">0.3×</p>
                    <p className="text-[10px] text-slate-500 mt-1">Sin oficial</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-brand-50 border border-brand-200 p-3 text-center">
                    <p className="text-2xl font-black text-brand-700">0.5×</p>
                    <p className="text-[10px] text-brand-600 mt-1 font-medium flex items-center justify-center gap-1">
                      <ShieldCheckIcon className="h-3 w-3" /> Con oficial
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">El multiplicador se aplica sobre el delta ELO calculado. Los partidos sin oficial valen menos para desincentivar el auto-reporte.</p>
              </div>

              {/* Auto-gobernanza */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <h3 className="text-xs font-black text-amber-700 uppercase tracking-wider mb-2">Auto-gobernanza</h3>
                <p className="text-xs text-amber-800">Si el host, el capitán rival o un oficial están inactivos durante el partido, cualquier jugador puede reportar su ausencia. Si más del 50% vota, el rol se reasigna automáticamente al jugador con más karma.</p>
              </div>

              {/* Requisitos */}
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Requisitos para jugar</h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />Necesitás un perfil de jugador vinculado a tu cuenta.</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />Tenés que habilitar el GPS para el check-in y para ver lobbies cercanos.</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />No asistir después de unirte baja drásticamente tu Karma.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            Dodgeball Calle
            <span className="px-2 py-1 text-xs font-semibold bg-brand-100 text-brand-700 rounded-full">Beta</span>
            <button
              onClick={() => setShowInfo(true)}
              className="text-slate-400 hover:text-brand-600 transition-colors"
              aria-label="Cómo funciona La Plaza"
            >
              <InformationCircleIcon className="h-6 w-6" />
            </button>
          </h1>
          <p className="text-slate-600 mt-1">Crea o únete a partidos rankeados en tu zona.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ListBulletIcon className="h-4 w-4" /> Lista
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MapIcon className="h-4 w-4" /> Mapa
            </button>
          </div>

          <Link 
            to="/plaza/crear"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            Crear Lobby
          </Link>
        </div>
      </div>

      {lobbies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
          <MapPinIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No hay partidos cerca</h3>
          <p className="mt-1 text-sm text-slate-500">¡Sé el primero en crear uno en tu zona!</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lobbies.map((lobby) => (
            <Link 
              key={lobby._id} 
              to={`/plaza/lobby/${lobby._id}`}
              className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 font-bold group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    {lobby.title.substring(0, 2).toUpperCase()}
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    lobby.status === 'open' ? 'bg-green-100 text-green-700' : 
                    lobby.status === 'full' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {lobby.status === 'open' ? 'Buscando Jugadores' : 
                     lobby.status === 'full' ? 'Listo para Empezar' : 
                     lobby.status.charAt(0).toUpperCase() + lobby.status.slice(1)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 mb-2 truncate">
                  {lobby.title}
                </h3>

                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 shrink-0" />
                    <span>{new Date(lobby.scheduledDate).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{lobby.location.address || lobby.location.name}</span>
                    {lobby.distance !== undefined && (
                      <span className="text-brand-600 font-medium">({lobby.distance.toFixed(1)} km)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <UsersIcon className="h-4 w-4 shrink-0" />
                    <div className="flex items-center gap-2">
                      <span>{lobby.players.length} / {lobby.maxPlayers} Jugadores</span>
                      {lobby.categoria && lobby.categoria !== 'Libre' && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 rounded border border-indigo-100 uppercase font-bold">
                          {lobby.categoria === 'Masculino' ? '♂ Solo Hombres' : 
                           lobby.categoria === 'Femenino' ? '♀ Solo Mujeres' : 
                           '🚻 Mixto'}
                        </span>
                      )}
                    </div>
                  </div>
                  {(lobby.officials.length > 0 || lobby.requireOfficial) && (
                    <div className="flex items-center gap-2 text-brand-700">
                      <TrophyIcon className="h-4 w-4 shrink-0" />
                      <span className="flex items-center gap-1">
                        {lobby.officials.length > 0 ? 'Con Oficiales (+50% Ranking)' : 'Requiere Oficial'}
                        {!lobby.officials.length && lobby.requireOfficial && <span className="animate-pulse">⚠️</span>}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-brand-50 transition-colors">
                <span className="text-xs text-slate-400">Modalidad: {lobby.modalidad}</span>
                <span className="text-xs font-bold text-brand-600">UNIRSE →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[600px] relative z-0">
          <MapContainer 
            center={location ? [location.lat, location.lng] : [-34.6037, -58.3816]} 
            zoom={13} 
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Location Marker */}
            {location && (
              <Marker 
                position={[location.lat, location.lng]}
                icon={L.divIcon({
                  className: 'bg-none',
                  html: `<div class="p-1 bg-brand-600 rounded-full border-2 border-white shadow-lg animate-pulse h-4 w-4"></div>`
                })}
              >
                <Popup>Estás aquí</Popup>
              </Marker>
            )}

            {lobbies.map((lobby) => (
              <Marker 
                key={lobby._id} 
                position={[lobby.location.coordinates.lat, lobby.location.coordinates.lng]}
              >
                <Popup minWidth={200}>
                  <div className="p-1">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-2">{lobby.title}</h3>
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3 w-3 text-brand-600" />
                        {new Date(lobby.scheduledDate).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UsersIcon className="h-3 w-3 text-brand-600" />
                        {lobby.players.length} / {lobby.maxPlayers} Jugadores
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-slate-900">
                        <span className="px-1.5 py-0.5 bg-brand-50 rounded text-[9px] uppercase font-bold text-brand-700">
                          {lobby.modalidad} - {lobby.categoria}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/plaza/lobby/${lobby._id}`)}
                      className="mt-3 w-full py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors"
                    >
                      VER LOBBY
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

    </div>
  );
};

export default PlazaExplorar;
