import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CompetenciaService, type Competencia } from "../services/competenciaService";
import { RankedService, type LeaderboardItem, type LeaderboardResponse } from "../services/rankedService";
import { TemporadaService, type Temporada } from "../services/temporadaService";
import { PartidoService } from "../../partidos/services/partidoService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RankedEvolutionChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  competenciaId: string;
  defaultSeasonId?: string;
}

type TimeFilter = "all" | "month";

// Interfaces para mejorar type safety

export const RankedEvolutionChartModal: React.FC<RankedEvolutionChartModalProps> = ({
  isOpen,
  onClose,
  competenciaId,
  defaultSeasonId,
}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [visiblePlayersCount, setVisiblePlayersCount] = useState<number>(5); // -1 means ALL
  const [playerFilter, setPlayerFilter] = useState("");
  const [playerFilter2, setPlayerFilter2] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<string>(defaultSeasonId || "");
  const [seasonInitialized, setSeasonInitialized] = useState(false);
  const [isMobileView, setIsMobileView] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 640;
  });

  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { data: competencia } = useQuery<Competencia | undefined>({
    queryKey: ["competencia", competenciaId, "ranked-chart"],
    queryFn: () => CompetenciaService.getById(competenciaId),
    enabled: isOpen && !!competenciaId,
  });

  const modalidad = (competencia as any)?.modalidad || "Foam";
  const categoria = (competencia as any)?.categoria || "Libre";

  const { data: temporadas = [], isLoading: loadingTemporadas } = useQuery<Temporada[]>({
    queryKey: ["temporadas", competenciaId, "ranked-chart"],
    queryFn: () => TemporadaService.getByCompetencia(competenciaId),
    enabled: isOpen && !!competenciaId,
  });

  useEffect(() => {
    if (!isOpen || seasonInitialized) return;
    if (defaultSeasonId) {
      setSelectedSeason(defaultSeasonId);
      setSeasonInitialized(true);
      return;
    }
    if (temporadas.length > 0) {
      setSelectedSeason(temporadas[temporadas.length - 1]._id);
      setSeasonInitialized(true);
    }
  }, [isOpen, temporadas, defaultSeasonId, seasonInitialized]);

  const { data: leaderboardData, isLoading: loadingLeaderboard } = useQuery<LeaderboardResponse | null>({
    queryKey: ["ranked-evolution-leaderboard", competenciaId, selectedSeason, modalidad, categoria],
    queryFn: async () => {
      const seasonParam = selectedSeason === "global" ? undefined : selectedSeason;
      const primary = await RankedService.getLeaderboard({
        modalidad,
        categoria,
        competition: competenciaId,
        season: seasonParam,
        limit: 500,
      });

      // Fallback: si la temporada "0" no devuelve jugadores, intentar sin season (global histórico)
      if ((primary?.items?.length ?? 0) === 0 && selectedSeason === "0") {
        const fallback = await RankedService.getLeaderboard({
          modalidad,
          categoria,
          competition: competenciaId,
          season: undefined,
          limit: 500,
        });
        return fallback;
      }

      return primary;
    },
    enabled: isOpen && !!competencia && !!competenciaId && seasonInitialized,
  });

  useEffect(() => {
    if (!isOpen) return;
    setTimeFilter("all");
    setPlayerFilter("");
    setPlayerFilter2("");
    setVisiblePlayersCount(5);
  }, [selectedSeason, isOpen]);

  useEffect(() => {
    if (isOpen) return;
    setSelectedSeason(defaultSeasonId || "");
    setSeasonInitialized(false);
    setTimeFilter("all");
    setPlayerFilter("");
    setPlayerFilter2("");
    setVisiblePlayersCount(5);
  }, [isOpen, defaultSeasonId]);

  const leaderboard = useMemo(() => leaderboardData?.items || [], [leaderboardData]);

  const seasonOptions = useMemo(() => {
    return [{ _id: "global", nombre: "Histórico Global" }, ...temporadas];
  }, [temporadas]);

  const selectedSeasonLabel = useMemo(() => {
    return seasonOptions.find((t) => t._id === selectedSeason)?.nombre || "Histórico Global";
  }, [seasonOptions, selectedSeason]);

  const topPlayers: LeaderboardItem[] = useMemo(() => {
    const players = leaderboard || [];
    return players;
  }, [leaderboard]);

  const getMatchDate = (match: any) => {
    const raw = match?.fecha || match?.fechaPartido || match?.date || match?.createdAt || match?.updatedAt;
    if (!raw) return null;
    const hour = match?.hora || "00:00";
    const dateStr = typeof raw === "string" && raw.includes("T") ? raw : `${raw}T${hour}`;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // Nueva consulta para obtener los partidos reales de la competencia/temporada
  const { data: matchesData } = useQuery({
    queryKey: ["competition-matches", competenciaId, selectedSeason],
    queryFn: async () => {
      try {
        // Incluimos ambos nombres de campos para maximizar compatibilidad con el backend
        const baseFilters: any = {
          competition: competenciaId,
          competitionId: competenciaId,
          competencia: competenciaId,
          competenciaId,
        };

        // Caso global: traer todos los partidos por competencia
        if (!selectedSeason || selectedSeason === "global") {
          const res = await PartidoService.getAll(baseFilters);
          return res;
        }

        // Caso temporada específica: mandar ambos nombres de campo por compatibilidad (temporadaId/temporada)
        const seasonFilters = {
          ...baseFilters,
          season: selectedSeason,
          seasonId: selectedSeason,
          temporadaId: selectedSeason,
          temporada: selectedSeason,
        };
        let res = await PartidoService.getAll(seasonFilters);

        // Fallback: si la temporada "0" no devuelve nada, reintentar sin season (global histórico)
        if ((res?.length || 0) === 0 && selectedSeason === "0") {
          res = await PartidoService.getAll(baseFilters);
        }

        return res;
      } catch (err) {
        console.error("[RankedModal] Error cargando partidos:", err);
        return [];
      }
    },
    enabled: isOpen && !!competenciaId && seasonInitialized,
  });

  const { data: rawPlayersData, isLoading: loadingPlayers } = useQuery({
    queryKey: ["ranked-evolution-raw", competenciaId, selectedSeason, topPlayers.map(p => p.playerId).join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        topPlayers.map(async (player) => {
          try {
            // DISCRIMINACIÓN DE NIVELES DE RANKING (Sincronizado con Backend)
            const detail = await RankedService.getPlayerDetail(player.playerId, {
              competition: competenciaId,
              season: selectedSeason === "global" ? "" : selectedSeason, // El backend ya interpreta "global" o "" como temporada nula
              modalidad,
              categoria,
            });

            // Intentamos buscar el historial en varios posibles nombres de campo
            const rawHistory = detail.history || (detail as any).items || (detail as any).data || (detail as any).ratings || [];
            
            const history = rawHistory
              .map((h: any) => ({
                ...h,
                date: new Date(h.updatedAt || h.createdAt),
                postRating: Number(h.postRating || h.rating || h.newRating || h.ratingActual || 0)
              }))
              .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

            return { 
                id: player.playerId,
                name: player.playerName, 
                history, 
                // rating es el campo tipado; dejamos fallback por si el backend envía alias antiguos
                currentElo: Number(player.rating ?? (player as any).elo ?? (player as any).ranking ?? 1500) 
            };
          } catch (e) {
            console.error(`[RankedChart] Error en jugador ${player.playerName}:`, e);
            return { id: player.playerId, name: player.playerName, history: [], currentElo: 1500 };
          }
        })
      );
      return results;
    },
    enabled: isOpen && topPlayers.length > 0 && !!competencia && seasonInitialized,
  });

  // Procesamiento de datos combinado (Historia + Partidos + Filtros)
  const evolutionaryData = useMemo(() => {
    if (!seasonInitialized) return { chartData: [], playerInfo: [] };
    if (!rawPlayersData) return { chartData: [], playerInfo: [] };

    // 1. Filtrar asegurando tipos de Fecha
    const filteredResults = rawPlayersData.map(player => {
        // Aseguramos que las fechas sean objetos Date reales
        let history = (player.history || []).map((h: any) => ({
            ...h,
            date: h.date instanceof Date ? h.date : new Date(h.date)
        }));

        // Validar que la fecha sea válida
        history = history.filter((h: any) => h.date && !isNaN(h.date.getTime()));

        // SORT history ascending
        history.sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

        return { ...player, history, usedEvents: new Set<number>() };
    });
    
    // 4. Construcción del gráfico basado en PARTIDOS (Skeleton)
    
    const chartData: any[] = [];
    const playerLastKnownRating: Record<string, number> = {}; // Para mantener el estado actual de la línea
    
    // Configuración de colores (usamos la misma paleta que en el render, pero definida aquí para el useMemo)
    const chartColors = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#64748b"];

    // PASO 0: Procesar todos los partidos relevantes para determinar fechas de corte y visualización
    // Fallback: si el endpoint de partidos devuelve vacío, generamos pseudo-partidos desde los histories
    const historyBasedMatches = filteredResults.flatMap((player) => {
      return (player.history || [])
        .filter((h: any) => h.date && !isNaN(h.date.getTime()))
        .map((h: any) => {
          const matchId = String(h.partidoId || h.matchId || h.idPartido || h.partido || h.referencia || h.referenciaId || "").trim();
          const key = matchId || `hist-${h.date.getTime()}`;
          return {
            _id: key,
            id: key,
            createdAt: h.date,
            updatedAt: h.date,
            fecha: h.date,
            _parsedDate: h.date instanceof Date ? h.date : new Date(h.date),
            fromHistory: true,
          };
        });
    });

    const rawMatches = (matchesData && matchesData.length > 0 ? matchesData : historyBasedMatches) || [];

    const relevantMatches = rawMatches
      .map((m: any) => ({ ...m, _parsedDate: m._parsedDate || getMatchDate(m) }))
      .filter((m: any) => m._parsedDate)
      .sort((a: any, b: any) => a._parsedDate.getTime() - b._parsedDate.getTime());

    // Filtro de fecha de corte
    let cutoffDate = new Date(0); // Default: Desde el principio de los tiempos
    if (timeFilter === "month") {
        // Opción 1: Anclar al final de la temporada seleccionada o último partido disponible
        let referenceDate = new Date(); // Fallback date
        
        const lastMatch = relevantMatches.length > 0 ? relevantMatches[relevantMatches.length - 1] : null;

        if (lastMatch?._parsedDate) {
          referenceDate = lastMatch._parsedDate;
        } else if (selectedSeason !== "global") {
            // Si no hay partidos pero hay temporada, intentar usar fecha de fin de temporada
            const season = temporadas.find(t => t._id === selectedSeason);
            if (season?.fechaFin) referenceDate = new Date(season.fechaFin);
        }

        const d = new Date(referenceDate);
        d.setMonth(d.getMonth() - 1);
        cutoffDate = d;
    }

    // PASO A: Determinar estado INICIAL (Punto de partida)
    const startEntry: any = { 
        matchLabel: "Inicio", 
        fullDate: cutoffDate.toLocaleDateString(),
        isStartNode: true 
    };
    
    filteredResults.forEach((r, idx) => {
        const key = `player_${idx}`;
        // Buscar el rating que tenía el jugador justo antes o en el momento del corte
        let startRating = 1500;
        
        // Buscamos el último evento ANTES de la fecha de corte
        const eventBefore = [...r.history].reverse().find((h: any) => h.date < cutoffDate);
        
        if (eventBefore) {
            startRating = eventBefore.postRating;
        } else if (r.history.length > 0) {
            // Si no hay evento antes, tomamos el preRating del primer evento disponible
            startRating = r.history[0].preRating || 1500;
        }

        playerLastKnownRating[key] = startRating;
        startEntry[key] = startRating;

        // Avanzar el cursor de historial hasta la fecha de corte para no procesar eventos viejos
        // OJO: No debemos avanzar ciegamente, sino estar listos para el primer partido > cutoffDate
        // Si hay eventos "sueltos" entre cutoff y primer partido, los ignoramos o asumimos que son ajustes
        // Vamos a dejar que el loop de partidos encuentre su evento correspondiente.
    });
    chartData.push(startEntry);

    // PASO B: Procesar PARTIDO A PARTIDO (Filtrados por la fecha de corte calculada)
    relevantMatches.filter((m: any) => m._parsedDate && m._parsedDate >= cutoffDate).forEach((match: any, index: number) => {
      const matchDate = match._parsedDate as Date;
        const entry: any = {
            matchLabel: `P${index + 1}`,
            fullDate: matchDate.toLocaleDateString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
        };

        let hasRelevantPlayers = false;

        filteredResults.forEach((player: any, idx: number) => {
            const key = `player_${idx}`;
            
            // 1. Determinar si el jugador PARTICIPÓ en el partido (ID match || Name match)
            
            // Función auxiliar para normalizar cadenas (minúsculas, sin acentos)
            const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

            const pId = String(player.id || "").trim();
            const pName = normalize(player.name || "");
            
            const localObj = match.equipoLocal || {};
            const visitObj = match.equipoVisitante || {};
            
            // IDs de equipos
            const localId = String(localObj.id || localObj._id || "").trim();
            const visitId = String(visitObj.id || visitObj._id || "").trim();
            
            // Nombres de equipos
            const localName = normalize(localObj.nombre || "");
            const visitName = normalize(visitObj.nombre || "");
            
            // Lógica de coincidencia: ID exacto O Nombre normalizado
            const isLocal = (pId && localId && pId === localId) || (pName && localName && pName === localName);
            const isVisit = (pId && visitId && pId === visitId) || (pName && visitName && pName === visitName);
            
            const mId = String(match.id || match._id || "").trim();

            // 2. Buscar evento de ranking correspondiente en el historial
            // INTENTO 1: Buscar por Match ID explícito
            let eventMatchIdx = player.history.findIndex((h: any, i: number) => {
                const hMatchId = String(h.partidoId || h.matchId || h.idPartido || h.partido || h.referencia || h.referenciaId || "").trim();
                return hMatchId && mId && hMatchId === mId && !player.usedEvents.has(i);
            });

            // INTENTO 2: Si no hay match ID, usar proximidad temporal (fallback)
            if (eventMatchIdx === -1 && player.history.length > 0) {
                 const rangeStart = matchDate.getTime() - (3 * 24 * 60 * 60 * 1000); // ampliar a 3 días antes por si se registró tarde
                 const rangeEnd = matchDate.getTime() + (3 * 24 * 60 * 60 * 1000);   // 3 dias despues
                 
                 let minDiff = Infinity;

                 player.history.forEach((h: any, i: number) => {
                     if (player.usedEvents.has(i)) return; // Ya usado en otro partido

                     const t = h.date.getTime();
                     if (t >= rangeStart && t <= rangeEnd) {
                         const diff = Math.abs(t - matchDate.getTime());
                         if (diff < minDiff) {
                             minDiff = diff;
                             eventMatchIdx = i;
                         }
                     }
                 });
                 
                 // Solo asignar si la diferencia es razonable (ej. menos de 48 horas) 
                 if (minDiff > 48 * 60 * 60 * 1000) {
                     eventMatchIdx = -1;
                 }
            }

            const eventMatch = eventMatchIdx !== -1 ? player.history[eventMatchIdx] : null;

            // ¿Jugó el partido?
            // Sí: Su ID/nombre coincide con el equipo (Padel 1v1) O encontramos un evento de historia que encaja.
            const played = isLocal || isVisit || !!eventMatch;

            if (played) {
                hasRelevantPlayers = true;
                
              if (eventMatch) {
                    player.usedEvents.add(eventMatchIdx);
                    const prevRating = playerLastKnownRating[key];
                    entry[key] = (eventMatch as any).postRating;
                    entry[`${key}_diff`] = (eventMatch as any).postRating - prevRating;
                    entry[`${key}_match`] = {
                        local: localObj.nombre,
                        visitante: visitObj.nombre,
                        resultado: match.resultado,
                        fase: match.fase
                    };
                    playerLastKnownRating[key] = (eventMatch as any).postRating;
                } else {
                    // Jugó pero no encontramos evento de ranking/historial.
                    // IMPORTANTE: Mostramos el punto con el mismo rating anterior (diff 0) 
                    // para indicar visualmente que participó en este partido.
                    entry[key] = playerLastKnownRating[key];
                    entry[`${key}_diff`] = 0; // Sin cambio detectado
                    entry[`${key}_match`] = {
                        local: localObj.nombre,
                        visitante: visitObj.nombre, 
                        resultado: match.resultado,
                  fase: match.fase,
                        note: "Sin cambio de ranking registrado"
                    };
                }
            } else {
                // NO JUGÓ
                entry[key] = null;
            }
        });

        if (hasRelevantPlayers) {
          chartData.push(entry);
        }
    });

    // PASO C: Punto FINAL (Estado Actual)
    const endEntry: any = { 
        matchLabel: "Actual", 
        fullDate: "Ahora",
        isEndNode: true
    };
    filteredResults.forEach((_, idx) => {
        const key = `player_${idx}`;
        endEntry[key] = playerLastKnownRating[key];
    });
    chartData.push(endEntry);


    return { 
        chartData, 
        playerInfo: filteredResults.map((r, i) => ({ 
            name: r.name, 
            key: `player_${i}`, 
            color: chartColors[i % chartColors.length] 
        })) 
    };
  }, [rawPlayersData, matchesData, timeFilter, selectedSeason, seasonInitialized, temporadas]);

  const isBusy = loadingPlayers || loadingLeaderboard || loadingTemporadas || !competencia;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full sm:max-w-5xl h-[94vh] sm:h-[85vh] rounded-t-[32px] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between bg-white shrink-0 border-b border-slate-100">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">Evolucion de Ranking</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Temporada: {selectedSeasonLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

         <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="px-4 sm:px-6 py-3 sm:py-4 grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2 sm:gap-4 shrink-0 overflow-hidden border-b border-slate-100 bg-white sm:bg-transparent sticky top-0 z-10">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm col-span-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest hidden xs:block">Temporada</span>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                disabled={loadingTemporadas || seasonOptions.length === 0}
                className="text-[11px] font-bold bg-transparent border-none p-0 focus:ring-0 text-slate-700 cursor-pointer appearance-none outline-none"
              >
                {seasonOptions.map((t) => (
                  <option key={t._id} value={t._id}>{t.nombre}</option>
                ))}
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth col-span-1 justify-end sm:justify-start">
              {[{ id: "all", label: "Total" }, { id: "month", label: "Mes" }].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTimeFilter(f.id as TimeFilter)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${timeFilter === f.id ? "bg-brand-600 text-white shadow-lg shadow-brand-200" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm shrink-0 col-span-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest hidden xs:block">Top</span>
              <select 
                value={visiblePlayersCount} 
                onChange={(e) => setVisiblePlayersCount(Number(e.target.value))} 
                className="text-[11px] font-bold bg-transparent border-none p-0 focus:ring-0 text-slate-700 cursor-pointer appearance-none outline-none"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <div className="flex items-center gap-2 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100 col-span-2 sm:col-span-1 w-full sm:max-w-xs">
              <input
                value={playerFilter}
                onChange={(e) => setPlayerFilter(e.target.value)}
                placeholder="Buscar jugador"
                className="w-full text-[11px] font-bold bg-transparent border-none p-0 focus:ring-0 text-slate-600 placeholder:text-slate-400"
              />
              {playerFilter && (
                <button onClick={() => setPlayerFilter("")} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100 col-span-2 sm:col-span-1 w-full sm:max-w-xs">
              <input
                value={playerFilter2}
                onChange={(e) => setPlayerFilter2(e.target.value)}
                placeholder="Buscar jugador 2"
                className="w-full text-[11px] font-bold bg-transparent border-none p-0 focus:ring-0 text-slate-600 placeholder:text-slate-400"
              />
              {playerFilter2 && (
                <button onClick={() => setPlayerFilter2("")} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
              )}
            </div>
          </div>

          <div className="flex-1 w-full p-3 sm:p-6 min-h-[360px] flex flex-col">
            {isBusy ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-50 border-t-brand-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Calculando puntos...</p>
              </div>
            ) : evolutionaryData?.chartData && evolutionaryData.chartData.length > 0 ? (
              <div className="w-full" style={{ height: isMobileView ? 340 : 400, minWidth: 0, minHeight: 300, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionaryData.chartData} margin={isMobileView ? { top: 8, right: 8, left: -20, bottom: 24 } : { top: 10, right: 30, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="matchLabel" fontSize={isMobileView ? 9 : 10} fontWeight={700} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} dy={10} interval={isMobileView ? 'preserveStartEnd' : 0} />
                      <YAxis hide={isMobileView} domain={["auto", "auto"]} fontSize={10} fontWeight={700} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} dx={-10} padding={{ top: 20, bottom: 20 }} />
                      <Tooltip 
                        labelFormatter={(v, p) => p[0]?.payload?.fullDate || v}
                        contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", fontSize: isMobileView ? "10px" : "11px", fontWeight: "800", padding: isMobileView ? "12px" : "16px" }} 
                        itemSorter={(item) => Number(item.value) * -1}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                             // Si es nodo inicial o final, simplificar tooltip
                             if (payload[0].payload.isStartNode) {
                                return (
                                    <div className="bg-white px-4 py-2 rounded-xl shadow-xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Inicio de periodo</p>
                                    </div>
                                );
                             }
                             if (payload[0].payload.isEndNode) {
                                return (
                                    <div className="bg-white px-4 py-2 rounded-xl shadow-xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Estado Actual</p>
                                    </div>
                                );
                             }

                             return (
                               <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 min-w-[200px]">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{payload[0].payload.fullDate}</p>
                                 <div className="space-y-3">
                                   {payload.map((p: any) => {
                                      const match = p.payload[`${p.dataKey}_match`];
                                      const diff = p.payload[`${p.dataKey}_diff`];
                                      const isPositive = diff > 0;

                                      return (
                                        <div key={p.dataKey} className="flex flex-col gap-1">
                                          <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                                              <span className="text-slate-700 font-extrabold">{p.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                              {diff !== undefined && diff !== 0 && (
                                                <span className={`text-[9px] font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                  {isPositive ? '+' : ''}{diff}
                                                </span>
                                              )}
                                              <span className="text-brand-600 font-black">{p.value}</span>
                                            </div>
                                          </div>
                                          {match && (
                                            <div className="ml-4 pl-2 border-l-2 border-slate-100 py-1 mt-1 bg-slate-50/50 rounded-r-lg">
                                               <p className="text-[9px] text-slate-500 font-bold leading-tight">
                                                 <span className="text-slate-400 font-black">VS: </span>
                                                 {match.local} vs {match.visitante}
                                               </p>
                                               <div className="flex items-center justify-between mt-0.5">
                                                 <p className="text-[9px] text-emerald-600 font-black">
                                                   Result: {match.resultado}
                                                 </p>
                                                 {match.fase && <span className="text-[8px] px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded font-bold uppercase tracking-wider">{match.fase}</span>}
                                               </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                   })}
                                 </div>
                               </div>
                             );
                          }
                          return null;
                        }}
                      />
                              <Legend verticalAlign="top" height={isMobileView ? 44 : 60} iconType="circle" wrapperStyle={{ fontSize: isMobileView ? "9px" : "10px", fontWeight: 800, paddingBottom: isMobileView ? "8px" : "20px" }} />
                              {(() => {
                                const normalize = (value: string) =>
                                  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                                const filter1 = normalize(playerFilter.trim());
                                const filter2 = normalize(playerFilter2.trim());
                                const hasAnyFilter = !!filter1 || !!filter2;

                                const list = (evolutionaryData.playerInfo || []).filter((p) =>
                                  !hasAnyFilter
                                    ? true
                                    : (() => {
                                        const name = normalize(p.name || "");
                                        const matches1 = !!filter1 && name.includes(filter1);
                                        const matches2 = !!filter2 && name.includes(filter2);
                                        return matches1 || matches2;
                                      })()
                                );
                                const visible = hasAnyFilter
                                  ? list
                                  : (visiblePlayersCount === -1 ? list : list.slice(0, visiblePlayersCount));
                                return visible;
                              })().map((info) => (
                        <Line 
                          key={info.key} 
                          type="stepAfter" 
                          dataKey={info.key}
                          name={info.name} 
                          stroke={info.color} 
                          strokeWidth={isMobileView ? 3 : 4} 
                          dot={{ r: isMobileView ? 3 : 4, strokeWidth: 0, fill: info.color }} 
                          activeDot={{ r: isMobileView ? 5 : 6, strokeWidth: 0 }} 
                          isAnimationActive={false}
                          connectNulls 
                        />
                      ))}
                    </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-3xl">
                <h4 className="text-slate-800 font-extrabold text-sm uppercase tracking-wider">Sin partidos registrados en esta temporada</h4>
                <p className="text-slate-400 text-xs mt-2">Prueba cambiando el filtro de temporada en el leaderboard.</p>
              </div>
            )}
          </div>

          <div className="px-6 py-6 border-t border-slate-50 bg-white sm:hidden shrink-0 mt-auto">
            <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-xl">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};