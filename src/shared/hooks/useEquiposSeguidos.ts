import { useCallback, useEffect, useState } from 'react';

/**
 * Equipos que el hincha sigue. Vive en localStorage, no en la cuenta: el hincha usa Public sin
 * login, y pedirle registrarse para "seguir" es justo la fricción que este feature quiere evitar.
 * Si más adelante hay cuenta, esto se puede sincronizar al loguearse sin cambiar la UI.
 *
 * Se guarda nombre y escudo además del id para poder pintar la home sin esperar a la red.
 */
export interface EquipoSeguido {
  id: string;
  nombre: string;
  escudo?: string;
}

const KEY = 'ot:equiposSeguidos';
const EVENTO = 'ot:equiposSeguidos:cambio';

const leer = (): EquipoSeguido[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data.filter((e) => e && typeof e.id === 'string') : [];
  } catch {
    return [];
  }
};

const escribir = (lista: EquipoSeguido[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(lista));
  } catch {
    /* modo privado / cuota llena: seguir igual en memoria */
  }
  // Avisar a los otros componentes de esta pestaña (el evento `storage` sólo llega a las demás).
  window.dispatchEvent(new Event(EVENTO));
};

export function useEquiposSeguidos() {
  const [seguidos, setSeguidos] = useState<EquipoSeguido[]>(leer);

  useEffect(() => {
    const sync = () => setSeguidos(leer());
    window.addEventListener(EVENTO, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENTO, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const sigue = useCallback((id: string) => seguidos.some((e) => e.id === id), [seguidos]);

  const alternar = useCallback((equipo: EquipoSeguido) => {
    const actual = leer();
    const ya = actual.some((e) => e.id === equipo.id);
    escribir(ya ? actual.filter((e) => e.id !== equipo.id) : [...actual, equipo]);
    return !ya;
  }, []);

  return { seguidos, sigue, alternar };
}
