import React, { type ReactNode } from 'react';
import ModalBase from '../../../../shared/components/ModalBase/ModalBase';
import Button from '../../../../shared/components/ui/Button/Button';

interface StartScreenProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  startLabel?: string;
  onStart: () => void;
  children?: ReactNode;
}

const StartScreen: React.FC<StartScreenProps> = ({ isOpen, title, subtitle, startLabel = 'Jugar', onStart, children }) => {
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
      size="md"
    >
      <div className="space-y-4 text-sm text-slate-700">
        {children}
        <div className="flex justify-end">
          <Button onClick={onStart} size="lg">{startLabel}</Button>
        </div>
      </div>
    </ModalBase>
  );
};

export default StartScreen;
