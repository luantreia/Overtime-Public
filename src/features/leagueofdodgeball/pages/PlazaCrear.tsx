import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlazaService } from '../services/plazaService';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

const LocationPicker = ({ lat, lng, onChange }: { lat: number, lng: number, onChange: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return lat !== 0 ? <Marker position={[lat, lng]} /> : null;
};

const PlazaCrear: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: -34.6037, // Default near a central point (can be improved with browser location)
    lng: -58.3816,
    startTime: '',
    requireOfficial: false,
    genderPolicy: 'open',
    modalidad: 'Cloth' as 'Foam' | 'Cloth',
    categoria: 'Libre' as 'Masculino' | 'Femenino' | 'Mixto' | 'Libre'
  });

  useEffect(() => {
    // Attempt to center map on user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }));
      });
    }

    const checkProfile = async () => {
      try {
        const profile = await PlazaService.getMyProfile();
        setHasProfile(!!profile);
      } catch (err) {
        setHasProfile(false);
      } finally {
        setCheckingProfile(false);
      }
    };
    checkProfile();
  }, []);

  if (checkingProfile) return <LoadingSpinner />;

  if (!hasProfile) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8">
          <div className="text-4xl mb-4">🛡️</div>
          <h2 className="text-xl font-bold text-orange-900">Perfil de Atleta Requerido</h2>
          <p className="text-orange-800 mb-6">
            Para crear partidos en La Plaza, necesitas tener un perfil vinculado a tu cuenta.
          </p>
          <button 
            onClick={() => navigate('/jugadores')}
            className="bg-orange-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-700 transition-all shadow-lg"
          >
            Buscar y Reclamar mi Perfil
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const lobby = await PlazaService.createLobby({
        title: formData.name,
        location: {
          name: formData.address,
          address: formData.address,
          coordinates: {
            lat: formData.lat,
            lng: formData.lng
          }
        },
        scheduledDate: new Date(formData.startTime).toISOString(),
        maxPlayers: 18, // Fixed to 18
        requireOfficial: formData.requireOfficial,
        genderPolicy: formData.genderPolicy,
        modalidad: formData.modalidad,
        categoria: formData.categoria
      });
      navigate(`/plaza/lobby/${lobby._id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Crear Lobby de La Plaza</h2>
          <p className="text-sm text-slate-500 mt-1">Organiza un partido rankeado de 18 jugadores</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Evento</label>
            <input
              type="text"
              required
              placeholder="Ej: Madrugón de Dodgeball - Parque Central"
              className="w-full border-slate-200 rounded-lg focus:ring-brand-500 focus:border-brand-500"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Fecha y Hora</label>
              <input
                type="datetime-local"
                required
                className="w-full border-slate-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm"
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Categoría</label>
              <select 
                className="w-full border-slate-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm"
                value={formData.categoria}
                onChange={e => {
                  const val = e.target.value as any;
                  let gp = 'open';
                  if (val === 'Masculino') gp = 'male';
                  if (val === 'Femenino') gp = 'female';
                  if (val === 'Mixto') gp = 'mixed';
                  setFormData({...formData, categoria: val, genderPolicy: gp as any});
                }}
              >
                <option value="Libre">Libre / Open</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Mixto">Mixto (Obligatorio)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Modalidad</label>
              <div className="flex gap-2">
                {['Cloth', 'Foam'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData({...formData, modalidad: m as any})}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                      formData.modalidad === m 
                      ? 'bg-brand-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end pb-1">
              <span className="text-xs text-slate-500 italic">Capacidad: 18 Jugadores (Fijo)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Selecciona Ubicación en el Mapa</label>
            <div className="h-64 rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0">
              <MapContainer center={[formData.lat, formData.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker 
                  lat={formData.lat} 
                  lng={formData.lng} 
                  onChange={(lat, lng) => setFormData({...formData, lat, lng})} 
                />
              </MapContainer>
            </div>
            <p className="mt-2 text-[10px] text-slate-400">
              Haz clic en el mapa para marcar el punto exacto del encuentro.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Lugar / Dirección</label>
            <input
              type="text"
              required
              placeholder="Ej: Plaza Mayor - Cancha Norte"
              className="w-full border-slate-200 rounded-lg focus:ring-brand-500 focus:border-brand-500"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-xl border border-brand-100">
              <input
                type="checkbox"
                id="requireOfficial"
                className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                checked={formData.requireOfficial}
                onChange={e => setFormData({...formData, requireOfficial: e.target.checked})}
              />
              <label htmlFor="requireOfficial" className="cursor-pointer">
                <p className="text-sm font-bold text-brand-900">Requerir Oficial (Ranking 0.5x)</p>
                <p className="text-xs text-brand-700">El partido solo será válido si un oficial verificado se une y valida.</p>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-100 transition-all disabled:opacity-50"
            >
              {loading ? 'CREANDO...' : 'PUBLICAR LOBBY'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlazaCrear;
