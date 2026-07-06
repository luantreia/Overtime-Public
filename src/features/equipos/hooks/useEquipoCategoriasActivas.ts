import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../../../utils/apiClient';
import { FaseService } from '../../competencias/services/faseService';
import { CompetenciaService } from '../../competencias/services/competenciaService';

export interface CategoriaActiva {
  competenciaId: string;
  competenciaNombre: string;
  faseId: string;
  faseNombre: string;
  posicion: number;
  total: number;
  puntos: number;
  partidosJugados: number;
  partidosGanados: number;
  partidosPerdidos: number;
}

interface ParticipacionFaseRow {
  _id?: string;
  id?: string;
  participacionTemporada?: { _id?: string; id?: string } | string;
  puntos: number;
  partidosJugados: number;
  partidosGanados: number;
  partidosPerdidos: number;
}

const pickFaseActual = (fases: Array<{ _id: string; nombre: string; estado?: string }>) => {
  if (fases.length === 0) return null;
  return fases.find((f) => f.estado === 'en_curso') || fases[fases.length - 1];
};

export const useEquipoCategoriasActivas = (
  equipoId: string | undefined,
  participacionesTemporada: any[] | undefined
) => {
  const activas = (participacionesTemporada || []).filter((p) => p?.estado === 'activo');
  const participacionIds = activas
    .map((p) => p?._id || p?.id)
    .filter(Boolean)
    .sort()
    .join(',');

  return useQuery<CategoriaActiva[]>({
    queryKey: ['equipo-categorias-activas', equipoId, participacionIds],
    queryFn: async () => {
      const resultados = await Promise.all(
        activas.map(async (p): Promise<CategoriaActiva | null> => {
          const temporadaId = p?.temporada?._id || p?.temporada?.id || (typeof p?.temporada === 'string' ? p.temporada : null);
          const competenciaRef = p?.temporada?.competencia;
          const competenciaId = typeof competenciaRef === 'string' ? competenciaRef : (competenciaRef?._id || competenciaRef?.id);
          if (!temporadaId || !competenciaId) return null;

          const fases = await FaseService.getByTemporada(temporadaId).catch(() => []);
          const fase = pickFaseActual(fases as any);
          if (!fase) return null;

          const [participaciones, competencia] = await Promise.all([
            fetchWithAuth<ParticipacionFaseRow[]>(`/participacion-fase?fase=${fase._id}`).catch(() => []),
            CompetenciaService.getById(competenciaId).catch(() => null),
          ]);

          if (!participaciones || participaciones.length === 0) return null;

          const propioId = String(p._id || p.id);
          const ordenados = [...participaciones].sort((a, b) => b.puntos - a.puntos);
          const index = ordenados.findIndex((row) => {
            const rowParticipacionId = typeof row.participacionTemporada === 'string'
              ? row.participacionTemporada
              : (row.participacionTemporada?._id || row.participacionTemporada?.id);
            return String(rowParticipacionId) === propioId;
          });
          if (index === -1) return null;

          const propio = ordenados[index];
          return {
            competenciaId,
            competenciaNombre: (competencia as any)?.nombre || 'Competencia',
            faseId: fase._id,
            faseNombre: fase.nombre,
            posicion: index + 1,
            total: ordenados.length,
            puntos: propio.puntos,
            partidosJugados: propio.partidosJugados,
            partidosGanados: propio.partidosGanados,
            partidosPerdidos: propio.partidosPerdidos,
          };
        })
      );
      return resultados.filter((r): r is CategoriaActiva => r !== null);
    },
    enabled: !!equipoId && activas.length > 0,
  });
};
