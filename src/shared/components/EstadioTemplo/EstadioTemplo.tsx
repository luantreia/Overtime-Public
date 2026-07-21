import React, { Suspense, useEffect, useState } from 'react';

const EstadioTemploScene = React.lazy(() => import('./EstadioTemploScene'));

const useMatchMedia = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
};

const usePrefiereMovimientoReducido = (): boolean => useMatchMedia('(prefers-reduced-motion: reduce)');

// La escena 3D es la pieza más pesada de la landing en el momento de carga (WebGL + chunk lazy).
// En mobile priorizamos velocidad de carga por sobre el impacto visual del fondo animado.
const useEsMobile = (): boolean => useMatchMedia('(max-width: 767px)');

// Mismo degradé que usaba el hero antes, para que la transición al cargar el chunk 3D sea invisible
const FallbackEstatico: React.FC = () => (
  <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
);

const EstadioTemplo: React.FC = () => {
  const movimientoReducido = usePrefiereMovimientoReducido();
  const esMobile = useEsMobile();

  return (
    <div className="h-full w-full overflow-hidden">
      {movimientoReducido || esMobile ? (
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
