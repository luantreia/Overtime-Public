import React from 'react';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import Button from '../../../shared/components/ui/Button/Button';

interface StartScreenProps {
  isOpen: boolean;
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ isOpen, onStart }) => {
  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={() => {}}
      title="Dodgeball 2D"
      subtitle="Vos y dos compañeros IA contra un equipo rival"
      showCloseButton={false}
      closeOnBackdrop={false}
      closeOnEscape={false}
      size="md"
    >
      <div className="space-y-4 text-sm text-slate-700">
        <ul className="space-y-1.5">
          <li><span className="font-semibold">WASD / Flechas</span> — moverte</li>
          <li><span className="font-semibold">Espacio</span> — tirar (apunta automático al rival más cercano)</li>
          <li><span className="font-semibold">Shift (mantené)</span> — intentar atajar una pelota que viene hacia vos</li>
          <li>Caminá sobre una pelota suelta para recogerla, y sobre los power-ups (⚡🔥🛡️⚽) para activarlos.</li>
          <li>Ganás eliminando a todo el equipo rival, o teniendo más eliminaciones cuando se acabe el tiempo (90s).</li>
        </ul>
        <div className="flex justify-end">
          <Button onClick={onStart} size="lg">Jugar</Button>
        </div>
      </div>
    </ModalBase>
  );
};

export default StartScreen;
