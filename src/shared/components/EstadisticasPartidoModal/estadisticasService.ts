import { authFetch } from '../../utils/authFetch';
import type {
  ResumenEstadisticasAutomaticas,
  ResumenEstadisticasManual,
} from './types';

/**
 * Las estadísticas de un partido para el portal público.
 *
 * Este archivo venía con un `authFetch` propio de plantilla —un `fetch` suelto con el comentario
 * "reemplaza con tu implementación"— que pegaba a rutas relativas sin ninguna base de API. O sea
 * que las llamadas iban al origen del propio frontend en Vercel y no al backend: nunca llegó un
 * pedido real. Y como el modal se traga el error, lo que veía el hincha era "sin estadísticas".
 *
 * Ahora usa el `authFetch` de la app, que es el que sabe la base de la API, y pega a los endpoints
 * **públicos**, que no piden token y sólo sirven filas con `estadoPublicacion: 'publica'`.
 *
 * Todas las llamadas van con `useAuth: false` a propósito: son rutas anónimas y acá no hay sesión.
 * Si alguna vez quedara un token viejo en el localStorage de este origen, tampoco se mandaría.
 */

/** Un solo pedido con todos los sets del partido y sus estadísticas públicas. */
export const getResumenEstadisticasAutomaticas = (
  partidoId: string,
): Promise<ResumenEstadisticasAutomaticas> =>
  authFetch<ResumenEstadisticasAutomaticas>(
    `/estadisticas/jugador-set/publico/partido/${partidoId}`,
    { useAuth: false },
  );

/** Los totales del partido, para los partidos cargados sin desglose por set. */
export const getResumenEstadisticasManual = (
  partidoId: string,
): Promise<ResumenEstadisticasManual> =>
  authFetch<ResumenEstadisticasManual>(
    `/estadisticas/jugador-partido-manual/publico/partido/${partidoId}`,
    { useAuth: false },
  );
