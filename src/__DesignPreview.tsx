import { Bracket } from './shared/components/Bracket/Bracket';
import type { Partido } from './features/partidos/services/partidoService';

// Playoffs reales 2024 de Liga Foam Masculino BA (la fase de la captura del usuario), con byes
// reales: 16vos y octavos tienen 1 solo partido cada uno, cuartos tiene 4.
const p = (id: string, local: string, visitante: string, ml: number, mv: number, etapa: Partido['etapa'], fecha: string): Partido => ({
  id,
  equipoLocal: { id: local, nombre: local },
  equipoVisitante: { id: visitante, nombre: visitante },
  marcadorLocal: ml,
  marcadorVisitante: mv,
  estado: 'finalizado',
  etapa,
  fecha,
});

const MATCHES: Partido[] = [
  p('m1', 'Berserk', 'Moran', 4, 2, 'dieciseisavos', '2024-11-24'),
  p('m2', 'Berserk', 'Linces de Alm. Brown', 7, 2, 'octavos', '2024-11-24'),
  p('m3', 'Supernova', 'Lynch', 8, 4, 'cuartos', '2024-11-24'),
  p('m4', 'Berserk', 'Panthers', 2, 6, 'cuartos', '2024-11-24'),
  p('m5', 'Hydra', 'Marvin', 6, 3, 'cuartos', '2024-11-24'),
  p('m6', 'Freestyle', 'Noazar', 3, 5, 'cuartos', '2024-11-24'),
  p('m7', 'Supernova', 'Hydra', 6, 4, 'semifinal', '2024-11-24'),
  p('m8', 'Panthers', 'Noazar', 10, 1, 'semifinal', '2024-11-24'),
  p('m9', 'Noazar', 'Hydra', 4, 6, 'tercer_puesto', '2024-12-01'),
  p('m10', 'Panthers', 'Supernova', 9, 4, 'final', '2024-12-01'),
];

export default function DesignPreview() {
  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
        Llave real — Liga Foam Masculino BA, Playoffs 2024
      </h2>
      <Bracket matches={MATCHES} />
    </div>
  );
}
