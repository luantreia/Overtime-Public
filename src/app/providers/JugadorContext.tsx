import React, { createContext, useContext, useState } from 'react';
import { Jugador } from '../../features/jugadores/services/jugadorService';

interface JugadorContextType {
  jugadorSeleccionado: Jugador | null;
  setJugadorSeleccionado: (jugador: Jugador | null) => void;
}

const JugadorContext = createContext<JugadorContextType | undefined>(undefined);

export const JugadorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<Jugador | null>(null);

  const value: JugadorContextType = {
    jugadorSeleccionado,
    setJugadorSeleccionado,
  };

  return <JugadorContext.Provider value={value}>{children}</JugadorContext.Provider>;
};

export const useJugador = () => {
  const context = useContext(JugadorContext);
  if (!context) {
    throw new Error('useJugador must be used within a JugadorProvider');
  }
  return context;
};
