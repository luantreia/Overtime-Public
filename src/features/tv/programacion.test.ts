import { grilla, inicioDelDia, ordenDelDia, type VideoTv } from './programacion';

const v = (id: string, duracion: number, comp = 'Liga'): VideoTv => ({
  _id: id,
  videoId: id.padEnd(11, 'x'),
  inicio: 0,
  duracion,
  competencia: { _id: comp, nombre: comp },
});

const videos = [v('a', 600), v('b', 1200), v('c', 900, 'Copa'), v('d', 300)];
const MEDIODIA = Date.UTC(2026, 10, 23, 15, 0, 0); // 12:00 en Argentina

describe('grilla de Overtime TV', () => {
  it('el día arranca a la medianoche de Argentina', () => {
    expect(new Date(inicioDelDia(MEDIODIA)).toISOString()).toBe('2026-11-23T03:00:00.000Z');
  });

  it('es la misma para cualquier cliente en el mismo instante', () => {
    expect(grilla(videos, '', MEDIODIA)).toEqual(grilla([...videos], '', MEDIODIA));
  });

  it('la emisión actual contiene al instante consultado', () => {
    for (let t = MEDIODIA; t < MEDIODIA + 3_600_000; t += 137_000) {
      const { actual } = grilla(videos, '', t);
      expect(actual!.desde).toBeLessThanOrEqual(t);
      expect(actual!.hasta).toBeGreaterThan(t);
    }
  });

  it('las emisiones son contiguas, sin huecos ni solapes', () => {
    const { emisiones } = grilla(videos, '', MEDIODIA, 5, 10);
    for (let i = 1; i < emisiones.length; i++) expect(emisiones[i].desde).toBe(emisiones[i - 1].hasta);
  });

  it('el canal sólo programa su competencia', () => {
    expect(ordenDelDia(videos, 'Copa', MEDIODIA).map((x) => x._id)).toEqual(['c']);
  });

  it('el orden cambia de un día a otro', () => {
    const muchos = Array.from({ length: 12 }, (_, i) => v(`id${i}`, 600));
    const hoy = ordenDelDia(muchos, '', MEDIODIA).map((x) => x._id);
    const manana = ordenDelDia(muchos, '', MEDIODIA + 86_400_000).map((x) => x._id);
    expect(hoy).not.toEqual(manana);
  });
});
