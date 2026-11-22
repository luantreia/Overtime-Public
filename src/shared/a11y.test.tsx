/**
 * Chequeo automático de accesibilidad (axe-core) sobre los componentes más vistos del portal.
 *
 * Corre en jsdom, así que NO mide contraste de color (jsdom no calcula estilos): eso lo cubren los
 * tokens `text-muted`/`text-2xs` del kit. Sí atrapa lo estructural: tablas sin encabezados,
 * botones sin nombre, roles inválidos, elementos interactivos anidados, ids duplicados.
 *
 * Para sumar un componente: renderizarlo con datos realistas y pasar el contenedor a `axe`.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TablaPosiciones, type ParticipacionFase } from './components/TablaPosiciones/TablaPosiciones';
import PartidoCard from './components/PartidoCard/PartidoCard';

expect.extend(toHaveNoViolations);

const participacion = (n: number, extra: Partial<ParticipacionFase> = {}): ParticipacionFase => ({
  id: `p${n}`,
  participacionTemporada: { equipo: { _id: `e${n}`, nombre: `Equipo ${n}`, escudo: null } },
  grupo: 'Zona A',
  puntos: 10 - n,
  partidosJugados: 4,
  partidosGanados: 4 - n,
  partidosPerdidos: n,
  partidosEmpatados: 0,
  diferenciaPuntos: 5 - n * 2,
  posicion: n,
  ...extra,
});

const tabla = [
  participacion(1, { clasificado: true }),
  participacion(2, { clasificado: true }),
  participacion(3),
  participacion(4, { eliminado: true }),
];

describe('accesibilidad (axe)', () => {
  it('TablaPosiciones de solo lectura', async () => {
    const { container } = render(<TablaPosiciones participaciones={tabla} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('TablaPosiciones con equipos clickeables', async () => {
    const { container } = render(<TablaPosiciones participaciones={tabla} onEquipoClick={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('PartidoCard en juego', async () => {
    const partido = {
      _id: 'x1',
      estado: 'en_juego',
      fecha: '2026-11-22',
      hora: '18:00',
      equipoLocal: { _id: 'e1', nombre: 'Equipo 1' },
      equipoVisitante: { _id: 'e2', nombre: 'Equipo 2' },
      marcadorLocal: 2,
      marcadorVisitante: 1,
    } as any;
    const { container } = render(
      <MemoryRouter>
        <PartidoCard partido={partido} variante="resultado" onClick={() => {}} />
      </MemoryRouter>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
