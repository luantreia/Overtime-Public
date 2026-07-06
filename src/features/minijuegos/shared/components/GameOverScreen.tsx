import React, { type ReactNode } from 'react';
import ModalBase from '../../../../shared/components/ModalBase/ModalBase';
import Button from '../../../../shared/components/ui/Button/Button';

interface GameOverScreenProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  restartLabel?: string;
  onRestart: () => void;
  children?: ReactNode;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  isOpen,
  title,
  subtitle,
  restartLabel = 'Jugar de nuevo',
  onRestart,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={() => {}}
      title={title}
      subtitle={subtitle}
      showCloseButton={false}
      closeOnBackdrop={false}
      closeOnEscape={false}
      size="sm"
    >
      <div className="space-y-4">
        {children}
        <div className="flex justify-end">
          <Button onClick={onRestart} size="lg">{restartLabel}</Button>
        </div>
      </div>
    </ModalBase>
  );
};

export default GameOverScreen;
