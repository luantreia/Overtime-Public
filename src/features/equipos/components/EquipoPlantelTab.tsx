import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../../shared/utils/formatDate';
import type { Equipo } from '../services/equipoService';

interface EquipoPlantelTabProps {
  equipo: Equipo;
}

const groupByJugador = (list: any[]) => {
  const map = new Map<string, { jugador: any; contratos: any[] }>();
  list.forEach((je: any) => {
    const jid = je.jugador?._id || je.jugador?.id;
    if (!jid) return;
    if (!map.has(jid)) map.set(jid, { jugador: je.jugador, contratos: [] });
    map.get(jid)!.contratos.push(je);
  });
  return Array.from(map.values()).map((g) => ({
    ...g,
    contratos: g.contratos.sort((a, b) => new Date(b.desde || 0).getTime() - new Date(a.desde || 0).getTime()),
  }));
};

export const EquipoPlantelTab: React.FC<EquipoPlantelTabProps> = ({ equipo }) => {
  const [activeTab, setActiveTab] = useState<'actual' | 'historial'>('actual');
  const equipoId = equipo._id || equipo.id;

  const { jugadoresActivos, jugadoresHistorial } = useMemo(() => {
    if (!equipo?.jugadoresEquipos) return { jugadoresActivos: [], jugadoresHistorial: [] };

    const hoy = new Date();

    const activos = equipo.jugadoresEquipos.filter((je: any) => {
      if (je.estado !== 'aceptado') return false;
      if (!je.hasta) return true;
      return new Date(je.hasta) >= hoy;
    });

    const historial = equipo.jugadoresEquipos.filter((je: any) => {
      if (je.estado === 'baja') return true;
      if (je.estado === 'aceptado' && je.hasta && new Date(je.hasta) < hoy) return true;
      return false;
    });

    return { jugadoresActivos: activos, jugadoresHistorial: historial };
  }, [equipo]);

  const jugadoresActivosAgrupados = useMemo(() => groupByJugador(jugadoresActivos), [jugadoresActivos]);
  const jugadoresHistorialAgrupados = useMemo(() => groupByJugador(jugadoresHistorial), [jugadoresHistorial]);

  const temporadasGanadas = useMemo(() => {
    return (equipo.participaciontemporadas || [])
      .filter((p: any) => p?.temporada?.ganador && String(p.temporada.ganador) === String(equipoId))
      .map((p: any) => ({
        inicio: p.temporada?.fechaInicio ? new Date(p.temporada.fechaInicio).getTime() : null,
        fin: p.temporada?.fechaFin ? new Date(p.temporada.fechaFin).getTime() : null,
      }))
      .filter((t: any) => t.inicio || t.fin);
  }, [equipo, equipoId]);

  const tieneTitulo = (contratos: any[]) => {
    if (temporadasGanadas.length === 0) return false;
    return contratos.some((c) => {
      const desde = c.desde ? new Date(c.desde).getTime() : null;
      const hasta = c.hasta ? new Date(c.hasta).getTime() : null;
      return temporadasGanadas.some((t: any) => {
        const inicioOk = !t.fin || !desde || desde <= t.fin;
        const finOk = !t.inicio || !hasta || hasta >= t.inicio;
        return inicioOk && finOk;
      });
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="h-8 w-1 bg-brand-600 rounded-full"></span>
          Plantel
        </h2>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('actual')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'actual' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Actual
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'historial' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Historial
          </button>
        </div>
      </div>

      {activeTab === 'actual' ? (
        jugadoresActivosAgrupados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {jugadoresActivosAgrupados.map(({ jugador, contratos }) => (
              <Link
                key={jugador?._id || jugador?.id}
                to={`/jugadores/${jugador?._id || jugador?.id}`}
                className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-200 transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 flex-shrink-0">
                  {jugador?.foto ? (
                    <img src={jugador.foto} alt={jugador.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-slate-300">{jugador?.nombre?.charAt(0) || '?'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                    {jugador?.nombre}
                    {tieneTitulo(contratos) && <span title="Campeón con este equipo">🏆</span>}
                  </div>
                  {contratos.length === 1 ? (
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      {contratos[0].numeroCamiseta && (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">#{contratos[0].numeroCamiseta}</span>
                      )}
                      <span className="capitalize">{contratos[0].rol || 'Jugador'}</span>
                    </div>
                  ) : (
                    <div className="mt-1 space-y-0.5">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{contratos.length} contratos</span>
                      {contratos.map((c: any) => (
                        <div key={c._id} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span className="capitalize">{c.rol || 'jugador'}</span>
                          <span>·</span>
                          <span>{c.desde ? formatDate(c.desde) : '—'} – {c.hasta ? formatDate(c.hasta) : 'presente'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-12 border border-slate-100 text-center">
            <div className="mx-auto h-12 w-12 text-slate-300 mb-4 text-center flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.998 5.998 0 00-12 0m12 0c0-1.657-1.343-3-3-3m-3 3c0-1.657-1.343-3-3-3m-3 3c0-1.657-1.343-3-3-3m-3 3a5.998 5.998 0 0112 0" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">Sin jugadores activos</h3>
            <p className="text-sm text-slate-500 mt-2">No se encontraron jugadores con contrato vigente en este equipo.</p>
          </div>
        )
      ) : jugadoresHistorialAgrupados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {jugadoresHistorialAgrupados.map(({ jugador, contratos }) => (
            <Link
              key={jugador?._id || jugador?.id}
              to={`/jugadores/${jugador?._id || jugador?.id}`}
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm opacity-75 hover:opacity-100 transition-opacity"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden grayscale flex-shrink-0">
                {jugador?.foto ? (
                  <img src={jugador.foto} alt={jugador.nombre} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-slate-300">{jugador?.nombre?.charAt(0) || '?'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                  {jugador?.nombre}
                  {tieneTitulo(contratos) && <span title="Campeón con este equipo">🏆</span>}
                </div>
                {contratos.length === 1 ? (
                  <div className="text-xs text-slate-500">
                    {contratos[0].hasta ? `Hasta: ${formatDate(contratos[0].hasta)}` : 'Contrato finalizado'}
                  </div>
                ) : (
                  <div className="mt-1 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{contratos.length} contratos anteriores</span>
                    {contratos.map((c: any) => (
                      <div key={c._id} className="text-[11px] text-slate-400">
                        {c.desde ? formatDate(c.desde) : '—'} – {c.hasta ? formatDate(c.hasta) : 'Contrato finalizado'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl p-12 border border-slate-100 text-center">
          <p className="text-slate-500">No hay historial de antiguos jugadores disponible.</p>
        </div>
      )}
    </div>
  );
};
