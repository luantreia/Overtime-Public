import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { RankedService } from "../services/rankedService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface RankedEvolutionChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  competenciaId: string;
  seasonId?: string;
  modalidad: string;
  categoria: string;
  leaderboard: any[];
}

type TimeFilter = "all" | "month";

export const RankedEvolutionChartModal: React.FC<RankedEvolutionChartModalProps> = ({
  isOpen,
  onClose,
  competenciaId,
  seasonId,
  modalidad,
  categoria,
  leaderboard,
}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [viewType, setViewType] = useState<"line" | "area">("line");
  const [visiblePlayersCount, setVisiblePlayersCount] = useState(5);

  const topPlayers = useMemo(() => (leaderboard || []).slice(0, 10), [leaderboard]);

  const { data: evolutionaryData, isLoading, isError } = useQuery({
    queryKey: ["ranked-evolution", competenciaId, seasonId, topPlayers.map(p => p.playerId).join(","), timeFilter],
    queryFn: async () => {
      const results = await Promise.all(
        topPlayers.map(async (player) => {
          try {
            const detail = await RankedService.getPlayerDetail(player.playerId, {
              competition: competenciaId,
              season: seasonId,
              modalidad,
              categoria,
            });
            
            // FILTRADO ESTRICTO: Solo historial de esta competencia y temporada
            // Agregamos log de depuración interno para ID
            let history = (detail.history || [])
              .filter((h: any) => {
                const hCompId = (h.competitionId || h.competition || "").toString();
                const targetCompId = competenciaId.toString();
                const hSeasonId = (h.seasonId || h.season || "").toString();
                const targetSeasonId = (seasonId || "").toString();

                const matchesCompetition = hCompId === targetCompId;
                const matchesSeason = !targetSeasonId || hSeasonId === targetSeasonId;
                
                return matchesCompetition && matchesSeason;
              })
              .map((h: any) => ({
                ...h,
                date: new Date(h.updatedAt || h.createdAt),
                postRating: Number(h.postRating)
              }))
              .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

            if (timeFilter === "month") {
              const filterDate = new Date();
              filterDate.setMonth(filterDate.getMonth() - 1);
              history = history.filter((h: any) => h.date >= filterDate);
            }

            return { name: player.playerName, history, currentElo: Number(player.elo || player.ranking || 1500) };
          } catch (e) {
            return { name: player.playerName, history: [], currentElo: 1500 };
          }
        })
      );

      const allDatesSet = new Set<string>();
      results.forEach(r => r.history.forEach((h: any) => allDatesSet.add(h.date.toISOString())));
      const sortedDates = Array.from(allDatesSet).sort();

      const chartData: any[] = [];
      const currentRatings: Record<string, number> = {};

      // Inicialización con el primer valor real de cada jugador
      results.forEach(r => {
          currentRatings[r.name] = r.history.length > 0 ? r.history[0].preRating || 1500 : 1500;
      });

      sortedDates.forEach((isoDate, index) => {
        const dateObj = new Date(isoDate);
        const entry: any = { 
          matchLabel: `P${index + 1}`,
          fullDate: dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
        };
        
        results.forEach(playerData => {
            const historyEntry = playerData.history.find((h: any) => h.date.toISOString() === isoDate);
            if (historyEntry) {
                currentRatings[playerData.name] = historyEntry.postRating;
            }
            entry[playerData.name] = Number(currentRatings[playerData.name]);
        });
        chartData.push(entry);
      });

      return { chartData, playerNames: results.map(r => r.name) };
    },
    enabled: isOpen && topPlayers.length > 0,
  });

  if (!isOpen) return null;

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#64748b"];

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full sm:max-w-5xl h-[92vh] sm:h-[85vh] rounded-t-[32px] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Evolucion de Ranking</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Temporada Seleccionada</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="px-6 py-4 flex flex-col gap-4 shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[{ id: "all", label: "Historial Total" }, { id: "month", label: "Ultimo Mes" }].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTimeFilter(f.id as TimeFilter)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${timeFilter === f.id ? "bg-brand-600 text-white shadow-lg shadow-brand-200" : "bg-slate-50 text-slate-500"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-1">
                  <button onClick={() => setViewType("line")} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${viewType === "line" ? "bg-white text-brand-600 shadow-sm ring-1 ring-slate-100" : "text-slate-400"}`}>Lineas</button>
                  <button onClick={() => setViewType("area")} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${viewType === "area" ? "bg-white text-brand-600 shadow-sm ring-1 ring-slate-100" : "text-slate-400"}`}>Areas</button>
               </div>
               <div className="flex items-center gap-2 pr-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Mostrar</span>
                  <select value={visiblePlayersCount} onChange={(e) => setVisiblePlayersCount(Number(e.target.value))} className="text-[11px] font-bold bg-transparent border-none p-0 focus:ring-0 text-slate-600 cursor-pointer">
                    <option value={3}>TOP 3</option>
                    <option value={5}>TOP 5</option>
                    <option value={10}>TOP 10</option>
                  </select>
               </div>
            </div>
          </div>

          <div className="flex-1 w-full p-4 sm:p-6 min-h-[400px]">
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-50 border-t-brand-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Calculando puntos...</p>
              </div>
            ) : evolutionaryData?.chartData && evolutionaryData.chartData.length > 0 ? (
              <div className="w-full h-full min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {viewType === "line" ? (
                    <LineChart data={evolutionaryData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="matchLabel" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} dy={10} />
                      <YAxis domain={["auto", "auto"]} fontSize={10} fontWeight={700} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} dx={-10} padding={{ top: 20, bottom: 20 }} />
                      <Tooltip 
                        labelFormatter={(v, p) => p[0]?.payload?.fullDate || v}
                        contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "800", padding: "16px" }} 
                        itemSorter={(item) => Number(item.value) * -1}
                      />
                      <Legend verticalAlign="top" height={60} iconType="circle" wrapperStyle={{ fontSize: "10px", fontWeight: 800, paddingBottom: "20px" }} />
                      {evolutionaryData.playerNames.slice(0, visiblePlayersCount).map((name, index) => (
                        <Line 
                          key={name} 
                          type="stepAfter" 
                          dataKey={name} 
                          stroke={colors[index % colors.length]} 
                          strokeWidth={4} 
                          dot={{ r: 4, strokeWidth: 0, fill: colors[index % colors.length] }} 
                          activeDot={{ r: 6, strokeWidth: 0 }} 
                          isAnimationActive={false}
                          connectNulls 
                        />
                      ))}
                    </LineChart>
                  ) : (
                    <AreaChart data={evolutionaryData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                      <defs>
                        {evolutionaryData.playerNames.slice(0, visiblePlayersCount).map((name, index) => (
                          <linearGradient key={`grad-${name}`} id={`color-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="matchLabel" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} dy={10} />
                      <YAxis domain={["auto", "auto"]} fontSize={10} fontWeight={700} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} dx={-10} padding={{ top: 20, bottom: 20 }} />
                      <Tooltip 
                        labelFormatter={(v, p) => p[0]?.payload?.fullDate || v}
                        contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "800", padding: "16px" }} 
                        itemSorter={(item) => Number(item.value) * -1}
                      />
                      <Legend verticalAlign="top" height={60} iconType="circle" wrapperStyle={{ fontSize: "10px", fontWeight: 800, paddingBottom: "20px" }} />
                      {evolutionaryData.playerNames.slice(0, visiblePlayersCount).map((name, index) => (
                        <Area 
                          key={name} 
                          type="stepAfter" 
                          dataKey={name} 
                          stroke={colors[index % colors.length]} 
                          strokeWidth={4} 
                          fill={`url(#color-${index})`}
                          isAnimationActive={false}
                          connectNulls 
                        />
                      ))}
                    </AreaChart>
                  )}
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