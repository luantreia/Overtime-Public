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

  const topPlayers = useMemo(() => leaderboard.slice(0, 10), [leaderboard]);

  const { data: evolutionaryData, isLoading } = useQuery({
    queryKey: ["ranked-evolution", competenciaId, seasonId, topPlayers.map(p => p.playerId).join(","), timeFilter],
    queryFn: async () => {
      const results = await Promise.all(
        topPlayers.map(async (player) => {
          const detail = await RankedService.getPlayerDetail(player.playerId, {
            competition: competenciaId,
            season: seasonId,
            modalidad,
            categoria,
          });
          
          let history = (detail.history || []).map((h: any) => ({
            ...h,
            date: new Date(h.createdAt || h.updatedAt)
          })).sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

          if (timeFilter === "month") {
            const now = new Date();
            const filterDate = new Date();
            filterDate.setMonth(now.getMonth() - 1);
            history = history.filter((h: any) => h.date >= filterDate);
          }

          return { name: player.playerName, history };
        })
      );

      const allDates = new Set<string>();
      results.forEach(r => r.history.forEach((h: any) => allDates.add(h.date.toISOString())));
      const sortedDates = Array.from(allDates).sort();

      const chartData: any[] = [];
      const currentRatings: Record<string, number> = {};

      results.forEach(r => {
          currentRatings[r.name] = r.history.length > 0 ? r.history[0].preRating : 1500;
      });

      sortedDates.forEach((isoDate, index) => {
        const dateObj = new Date(isoDate);
        const entry: any = { 
          date: dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
          matchIndex: index + 1 
        };
        
        results.forEach(playerData => {
            const historyEntry = playerData.history.find((h: any) => h.date.toISOString() === isoDate);
            if (historyEntry) currentRatings[playerData.name] = historyEntry.postRating;
            entry[playerData.name] = currentRatings[playerData.name];
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
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full sm:max-w-5xl h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-[32px] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Evolución de Ranking</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Actualizado hoy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col min-h-0">
          <div className="px-6 pb-4 bg-white flex flex-col gap-4 shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {[{ id: "all", label: "Temporada" }, { id: "month", label: "Último Mes" }].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTimeFilter(f.id as TimeFilter)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${timeFilter === f.id ? "bg-brand-600 text-white shadow-lg" : "bg-slate-50 text-slate-500 border border-slate-100"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-1">
                  <button onClick={() => setViewType("line")} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${viewType === "line" ? "bg-white text-brand-600 shadow-sm" : "text-slate-400"}`}>Líneas</button>
                  <button onClick={() => setViewType("area")} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${viewType === "area" ? "bg-white text-brand-600 shadow-sm" : "text-slate-400"}`}>Áreas</button>
               </div>
               <div className="flex items-center gap-2 pr-2">
                  <select value={visiblePlayersCount} onChange={(e) => setVisiblePlayersCount(Number(e.target.value))} className="text-[11px] font-bold bg-transparent border-none p-0 focus:ring-0 text-slate-600 cursor-pointer">
                    <option value={3}>TOP 3</option>
                    <option value={5}>TOP 5</option>
                    <option value={10}>TOP 10</option>
                  </select>
               </div>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col min-h-[400px] bg-white px-2 sm:px-6 pb-6 overflow-hidden">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
                <div className="w-12 h-12 border-4 border-slate-50 border-t-brand-500 rounded-full animate-spin"></div>
              </div>
            ) : evolutionaryData?.chartData.length ? (
              <div className="flex-1 w-full min-h-0 flex flex-col">
                <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                  {viewType === "line" ? (
                    <LineChart data={evolutionaryData.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} dy={10} interval="preserveStartEnd" />
                      <YAxis domain={["auto", "auto"]} fontSize={10} fontWeight={700} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", fontSize: "11px" }} />
                      <Legend verticalAlign="top" height={50} iconType="circle" wrapperStyle={{ fontSize: "9px", fontWeight: 800 }} />
                      {evolutionaryData.playerNames.slice(0, visiblePlayersCount).map((name, index) => (
                        <Line key={name} type="monotone" dataKey={name} stroke={colors[index % colors.length]} strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} animationDuration={1000} />
                      ))}
                    </LineChart>
                  ) : (
                    <AreaChart data={evolutionaryData.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <defs>
                        {evolutionaryData.playerNames.slice(0, visiblePlayersCount).map((name, index) => (
                          <linearGradient key={`grad-${name}`} id={`color-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} dy={10} interval="preserveStartEnd" />
                      <YAxis domain={["auto", "auto"]} fontSize={10} fontWeight={700} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", fontSize: "11px" }} />
                      <Legend verticalAlign="top" height={50} iconType="circle" wrapperStyle={{ fontSize: "9px", fontWeight: 800 }} />
                      {evolutionaryData.playerNames.slice(0, visiblePlayersCount).map((name, index) => (
                        <Area key={name} type="monotone" dataKey={name} stroke={colors[index % colors.length]} strokeWidth={3} fillOpacity={1} fill={`url(#color-${index})`} />
                      ))}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-[32px] mb-4">
                <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">Historial vacío</h4>
              </div>
            )}
          </div>

          <div className="px-6 py-6 border-t border-slate-50 bg-white sm:hidden">
            <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase transition-all">Cerrar Panel</button>
          </div>
        </div>
      </div>
    </div>
  );
};
