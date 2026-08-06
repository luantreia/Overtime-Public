import React, { useEffect, useMemo, useRef, useState } from 'react';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { ShareCardShell } from '../../../shared/components/ShareCardShell/ShareCardShell';
import { ShareRatioSwitch, SHARE_RATIO_ASPECT, type ShareRatio } from '../../../shared/components/ShareCardShell/ShareRatioSwitch';
import { ShareDownloadButtons } from '../../../shared/components/ShareDownloadButtons/ShareDownloadButtons';
import { useShareImage } from '../../../shared/hooks/useShareImage';
import RankingCardHeader, { type RankingScope } from './RankingCardHeader';

export interface RelationItem {
  id: string;
  name: string;
  matches: number;
  wins: number;
  draws?: number;
  losses?: number;
  winrate: number;
}

interface ShareRelationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  scope: RankingScope;
  synergy: RelationItem[];
  rivalry: RelationItem[];
}

type RelType = 'synergy' | 'rivalry';

const REL_COLOR: Record<RelType, string> = { synergy: '#22c55e', rivalry: '#ef4444' };
const REL_LABEL: Record<RelType, string> = {
  synergy: 'Con quién gana más — sinergias',
  rivalry: 'Contra quién juega más — rivalidades',
};
// Tope de tarjetas visibles según el formato, para que la lista no desborde la card.
const MAX_BY_RATIO: Record<ShareRatio, number> = { card: 3, story: 5, square: 3 };

export const ShareRelationsModal: React.FC<ShareRelationsModalProps> = ({
  isOpen,
  onClose,
  playerName,
  scope,
  synergy,
  rivalry,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<ShareRatio>('story');
  const [relType, setRelType] = useState<RelType>(synergy.length > 0 ? 'synergy' : 'rivalry');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{ synergy: Set<string>; rivalry: Set<string> }>({
    synergy: new Set(synergy.slice(0, MAX_BY_RATIO.story).map((s) => s.id)),
    rivalry: new Set(rivalry.slice(0, MAX_BY_RATIO.story).map((r) => r.id)),
  });
  const max = MAX_BY_RATIO[ratio];

  // Si el modal se abre con datos nuevos (otro jugador), arrancar con los primeros del formato actual.
  useEffect(() => {
    if (!isOpen) return;
    setRelType(synergy.length > 0 ? 'synergy' : 'rivalry');
    setSearch('');
    setSelected({
      synergy: new Set(synergy.slice(0, MAX_BY_RATIO.story).map((s) => s.id)),
      rivalry: new Set(rivalry.slice(0, MAX_BY_RATIO.story).map((r) => r.id)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, playerName]);

  // Si el formato baja el tope (ej. de Story a Post), recortar el excedente manteniendo el orden ya elegido.
  useEffect(() => {
    setSelected((prev) => {
      const trim = (set: Set<string>) => (set.size > max ? new Set(Array.from(set).slice(0, max)) : set);
      const nextSynergy = trim(prev.synergy);
      const nextRivalry = trim(prev.rivalry);
      if (nextSynergy === prev.synergy && nextRivalry === prev.rivalry) return prev;
      return { synergy: nextSynergy, rivalry: nextRivalry };
    });
  }, [max]);

  const { handleShare, handleDownload, loadingShare, loadingDownload } = useShareImage(cardRef, {
    filename: `overtime-${relType}-${playerName.replace(/\s+/g, '-').toLowerCase()}.png`,
    shareTitle: `${relType === 'synergy' ? 'Sinergias' : 'Rivalidades'} de ${playerName}`,
  });

  const currentList = relType === 'synergy' ? synergy : rivalry;
  const currentSelected = selected[relType];
  const rows = useMemo(
    () => currentList.filter((item) => currentSelected.has(item.id)),
    [currentList, currentSelected],
  );
  const visibleList = useMemo(
    () => currentList.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase())),
    [currentList, search],
  );
  const atMax = currentSelected.size >= max;

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev[relType]);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= max) return prev;
        next.add(id);
      }
      return { ...prev, [relType]: next };
    });
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Compartir sinergias / rivalidades" size="lg">
      <div className="p-6 flex flex-col items-center">
        <div className="mb-4 flex w-full flex-wrap items-center gap-2">
          {synergy.length > 0 && rivalry.length > 0 && (
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => { setRelType('synergy'); setSearch(''); }}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  relType === 'synergy' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                🟢 Sinergias
              </button>
              <button
                type="button"
                onClick={() => { setRelType('rivalry'); setSearch(''); }}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  relType === 'rivalry' ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                🔴 Rivalidades
              </button>
            </div>
          )}
          <ShareRatioSwitch value={ratio} onChange={setRatio} options={['card', 'story']} />
        </div>

        {currentList.length > 0 && (
          <div className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Elegí quiénes aparecen</p>
              <span className={`text-[11px] font-bold ${atMax ? 'text-brand-600' : 'text-slate-400'}`}>
                {currentSelected.size}/{max}
              </span>
            </div>

            {currentList.length > max && (
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre..."
                className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-brand-500"
              />
            )}

            <div className="flex flex-wrap gap-1.5">
              {visibleList.length === 0 && (
                <p className="text-xs text-slate-400 italic py-1">Sin resultados para "{search}".</p>
              )}
              {visibleList.map((item) => {
                const active = currentSelected.has(item.id);
                const disabled = !active && atMax;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleItem(item.id)}
                    title={disabled ? `Máximo ${max} para este formato` : undefined}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      active
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : disabled
                          ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'border-slate-300 bg-white text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <ShareCardShell ref={cardRef} aspectRatio={SHARE_RATIO_ASPECT[ratio]}>
          <div className="px-8 py-6 flex flex-col flex-1 text-white">
            <div className="mb-4">
              <RankingCardHeader scope={scope} />
            </div>

            <div className="my-auto flex flex-col w-full">
              <h2 className="text-center text-xl font-black mb-1">{playerName}</h2>
              <p className="text-center text-[10px] font-bold uppercase tracking-widest opacity-70 mb-4">
                {REL_LABEL[relType]}
              </p>

              {rows.length === 0 ? (
                <p className="text-center text-sm opacity-70 italic py-6">Elegí al menos uno en la lista de arriba.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {rows.map((item) => {
                    const losses = item.losses ?? Math.max(0, item.matches - item.wins - (item.draws ?? 0));
                    const winrate = Math.round(item.winrate);
                    return (
                      <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate">{item.name}</div>
                          <div className="text-[9px] opacity-70">
                            {item.matches} PJ · {item.wins}G {item.draws ?? 0}E {losses}P
                          </div>
                        </div>
                        <div className="h-1.5 w-16 rounded-full bg-white/20 overflow-hidden flex-shrink-0">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${winrate}%`, background: REL_COLOR[relType] }}
                          />
                        </div>
                        <div className="w-9 flex-shrink-0 text-right text-sm font-black">{winrate}%</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ShareCardShell>

        <div className="mt-8 w-full">
          <ShareDownloadButtons
            onShare={handleShare}
            onDownload={handleDownload}
            loadingShare={loadingShare}
            loadingDownload={loadingDownload}
          />
        </div>
      </div>
    </ModalBase>
  );
};
