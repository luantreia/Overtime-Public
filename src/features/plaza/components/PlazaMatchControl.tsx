import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, PauseIcon, StopIcon, PlusIcon, 
  TrashIcon, BoltIcon, ClockIcon 
} from '@heroicons/react/24/outline';

interface SetRecord {
  scoreA: number;
  scoreB: number;
  time: number; // match time in ms
}

interface PlazaMatchControlProps {
  lobbyId: string;
  onFinish: (sets: SetRecord[]) => void;
  actionLoading?: boolean;
}

export const PlazaMatchControl: React.FC<PlazaMatchControlProps> = ({ 
  lobbyId, 
  onFinish, 
  actionLoading 
}) => {
  const [sets, setSets] = useState<SetRecord[]>([]);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  
  // Timer State
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [lastStartTime, setLastStartTime] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  // Persistence Key
  const persistenceKey = `plaza_live_${lobbyId}`;

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(persistenceKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSets(parsed.sets || []);
        setScoreA(parsed.scoreA || 0);
        setScoreB(parsed.scoreB || 0);
        setAccumulatedTime(parsed.accumulatedTime || 0);
        setIsPaused(true); // Always start paused on load
      } catch (e) {
        console.error("Error loading saved plaza match", e);
      }
    }
  }, [persistenceKey]);

  // Save to localStorage
  useEffect(() => {
    const state = { sets, scoreA, scoreB, accumulatedTime };
    localStorage.setItem(persistenceKey, JSON.stringify(state));
  }, [sets, scoreA, scoreB, accumulatedTime, persistenceKey]);

  // Timer Interval
  useEffect(() => {
    let interval: any;
    if (!isPaused && lastStartTime) {
      interval = setInterval(() => {
        const currentElapsed = Date.now() - lastStartTime + accumulatedTime;
        setElapsed(currentElapsed);
      }, 100);
    } else {
      setElapsed(accumulatedTime);
    }
    return () => clearInterval(interval);
  }, [isPaused, lastStartTime, accumulatedTime]);

  const toggleTimer = () => {
    if (isPaused) {
      setLastStartTime(Date.now());
      setIsPaused(false);
    } else {
      if (lastStartTime) {
        setAccumulatedTime(prev => prev + (Date.now() - lastStartTime));
      }
      setLastStartTime(null);
      setIsPaused(true);
    }
  };

  const handleAddSet = (winner: 'A' | 'B') => {
    const newSets = [...sets, { 
      scoreA: winner === 'A' ? 1 : 0, 
      scoreB: winner === 'B' ? 1 : 0, 
      time: elapsed 
    }];
    setSets(newSets);
    if (winner === 'A') setScoreA(prev => prev + 1);
    else setScoreB(prev => prev + 1);
  };

  const removeLastSet = () => {
    if (sets.length === 0) return;
    const last = sets[sets.length - 1];
    setSets(sets.slice(0, -1));
    if (last.scoreA > last.scoreB) setScoreA(prev => Math.max(0, prev - 1));
    else setScoreB(prev => Math.max(0, prev - 1));
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    if (window.confirm("¿Deseas finalizar el partido y enviar los resultados para validación?")) {
      onFinish(sets);
      localStorage.removeItem(persistenceKey);
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl border-4 border-slate-800 animate-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BoltIcon className="h-6 w-6 text-yellow-400 animate-pulse" />
          <h3 className="font-black uppercase tracking-tighter text-xl">LIVE MATCH</h3>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
          <ClockIcon className="h-5 w-5 text-slate-400" />
          <span className="font-mono text-xl font-bold">{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Main Scoreboard */}
      <div className="flex items-center justify-around mb-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 relative overflow-hidden">
        <div className="text-center z-10">
          <div className="text-[10px] font-black text-red-500 uppercase mb-1">EQUIPO A</div>
          <div className="text-6xl font-black">{scoreA}</div>
        </div>
        <div className="text-3xl font-black text-slate-600 z-10">VS</div>
        <div className="text-center z-10">
          <div className="text-[10px] font-black text-blue-500 uppercase mb-1">EQUIPO B</div>
          <div className="text-6xl font-black">{scoreB}</div>
        </div>
        
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-500/5 to-blue-500/5"></div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handleAddSet('A')}
          className="bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-900/40 transition-all flex flex-col items-center gap-1 active:scale-95"
        >
          <PlusIcon className="h-6 w-6" />
          <span>SET A</span>
        </button>
        <button
          onClick={() => handleAddSet('B')}
          className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-900/40 transition-all flex flex-col items-center gap-1 active:scale-95"
        >
          <PlusIcon className="h-6 w-6" />
          <span>SET B</span>
        </button>
      </div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={toggleTimer}
          className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isPaused 
              ? 'bg-green-600 hover:bg-green-700 shadow-green-900/40 shadow-lg' 
              : 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-900/40 shadow-lg'
          }`}
        >
          {isPaused ? <PlayIcon className="h-6 w-6" /> : <PauseIcon className="h-6 w-6" />}
          {isPaused ? 'REANUDAR' : 'PAUSAR'}
        </button>
        <button
          onClick={removeLastSet}
          disabled={sets.length === 0}
          className="px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 disabled:opacity-20 transition-all"
        >
          <TrashIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Set List */}
      {sets.length > 0 && (
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {sets.map((s, i) => (
              <div key={i} className={`shrink-0 h-10 w-10 rounded-lg flex items-center justify-center font-bold text-xs border ${
                s.scoreA > s.scoreB 
                  ? 'bg-red-900/30 border-red-500 text-red-500' 
                  : 'bg-blue-900/30 border-blue-500 text-blue-500'
              }`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Finish Button */}
      <button
        onClick={handleFinish}
        disabled={actionLoading}
        className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all shadow-xl shadow-white/5 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <StopIcon className="h-6 w-6" />
        {actionLoading ? 'PROCESANDO...' : 'FINALIZAR Y ENVIAR'}
      </button>
    </div>
  );
};
