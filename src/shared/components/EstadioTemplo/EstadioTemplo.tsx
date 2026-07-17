import React, { Suspense, useEffect, useState } from 'react';

const EstadioTemploScene = React.lazy(() => import('./EstadioTemploScene'));

const usePrefiereMovimientoReducido = (): boolean => {
  const [reducido, setReducido] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducido(mq.matches);
    const onChange = () => setReducido(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reducido;
};

const FallbackEstatico: React.FC = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 text-center">
    <span className="text-5xl" aria-hidden="true">🏟️</span>
    <p className="text-sm font-semibold text-slate-300">The Temple</p>
  </div>
);

const EstadioTemplo: React.FC = () => {
  const movimientoReducido = usePrefiereMovimientoReducido();

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl sm:h-[520px]">
      {movimientoReducido ? (
        <FallbackEstatico />
      ) : (
        <Suspense fallback={<FallbackEstatico />}>
          <EstadioTemploScene />
        </Suspense>
      )}
    </div>
  );
};

export default EstadioTemplo;
