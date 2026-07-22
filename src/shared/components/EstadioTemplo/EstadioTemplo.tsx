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

// Mismo degradé que usaba el hero antes, para que la transición al cargar el chunk 3D sea invisible
const FallbackEstatico: React.FC = () => (
  <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
);

const EstadioTemplo: React.FC = () => {
  const movimientoReducido = usePrefiereMovimientoReducido();

  return (
    <div className="h-full w-full overflow-hidden">
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
