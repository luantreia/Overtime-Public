import React from 'react';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import Button from '../../../shared/components/ui/Button/Button';
import type { HudState } from '../game/types';

interface GameOverScreenProps {
  isOpen: boolean;
  hud: HudState;
  onRestart: () => void;
}

const RESULT_LABEL: Record<string, string> = {
  player: '¡Ganaste! 🏆',
  ai: 'Perdiste',
  draw: 'Empate',
};

const GameOverScreen: React.FC<GameOverScreenProps> = ({ isOpen, hud, onRestart }) => {
  if (!isOpen) return null;

  const resultLabel = hud.winner ? RESULT_LABEL[hud.winner] : '';

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={() => {}}
      title={resultLabel}
      subtitle={`${hud.eliminationsPlayerTeam} - ${hud.eliminationsAiTeam}`}
      showCloseButton={false}
      closeOnBackdrop={false}
      closeOnEscape={false}
      size="sm"
    >
      <div className="flex justify-end">
        <Button onClick={onRestart} size="lg">Jugar de nuevo</Button>
      </div>
    </ModalBase>
  );
};

export default GameOverScreen;
