import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * En una SPA, al navegar el foco se queda en el link que se clickeó (que muchas veces ya ni existe)
 * y el lector de pantalla no anuncia que cambió la página. Al cambiar de ruta movemos el foco al
 * <main> (que tiene tabIndex=-1) y, si es navegación hacia adelante, volvemos arriba de todo.
 *
 * Sólo reacciona al pathname: cambiar filtros (?search) o pestañas por query no es "otra página" y
 * mover el foco ahí sacaría al usuario del control que estaba usando.
 */
export function RouteFocus({ targetId }: { targetId: string }) {
  const { pathname } = useLocation();
  const tipo = useNavigationType();
  const primera = useRef(true);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    // Con atrás/adelante (POP) no subimos: el usuario espera volver a donde estaba en la lista.
    if (tipo !== 'POP') window.scrollTo(0, 0);
    document.getElementById(targetId)?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, targetId]);

  return null;
}
