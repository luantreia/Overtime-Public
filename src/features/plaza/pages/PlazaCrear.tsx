import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlazaService } from '../services/plazaService';

const PlazaCrear: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: 0,
    lng: 0,
    startTime: '',
    maxPlayers: 12,
    requireOfficial: false,
    genderPolicy: 'open'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const lobby = await PlazaService.createLobby({
        name: formData.name,
        location: {
          address: formData.address,
          lat: formData.lat,
          lng: formData.lng
        },
        startTime: formData.startTime,
        config: {
          maxPlayers: formData.maxPlayers,
          requireOfficial: formData.requireOfficial,
          genderPolicy: formData.genderPolicy
        }
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
          <p className="text-sm text-slate-500 mt-1">Organiza un partido rankeado en minutos</p>
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
              <label className="block text-sm font-bold text-slate-700 mb-1">Máximo Jugadores</label>
              <select 
                className="w-full border-slate-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm"
                value={formData.maxPlayers}
                onChange={e => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
              >
                <option value={12}>12 Jugadores (6v6)</option>
                <option value={14}>14 Jugadores (7v7)</option>
                <option value={18}>18 Jugadores (9v9 Full)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Dirección / Lugar</label>
            <input
              type="text"
              required
              placeholder="Ej: Calle 123, Ciudad de México"
              className="w-full border-slate-200 rounded-lg focus:ring-brand-500 focus:border-brand-500"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
            <p className="mt-1 text-[10px] text-slate-400">
              Usa una dirección real. Los jugadores deberán estar cerca para el check-in.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Latitud (Simulada)</label>
              <input
                type="number"
                step="any"
                required
                className="w-full border-slate-200 rounded-lg text-sm"
                value={formData.lat}
                onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Longitud (Simulada)</label>
              <input
                type="number"
                step="any"
                required
                className="w-full border-slate-200 rounded-lg text-sm"
                value={formData.lng}
                onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})}
              />
            </div>
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
