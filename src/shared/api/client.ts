// Public page API client (no auth required for most endpoints)
interface ApiConfig { baseUrl?: string; getToken?: () => string | null }
const defaultConfig: ApiConfig = { baseUrl: 'https://overtime-ddyl.onrender.com/api', getToken: () => localStorage.getItem('auth_token') };
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
async function request<T>(path: string, options: { method?: HttpMethod; body?: any; auth?: boolean; config?: ApiConfig } = {}): Promise<T> {
  const { method = 'GET', body, auth = false, config = defaultConfig } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = config.getToken?.();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${config.baseUrl}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) { let message = `Error ${res.status}`; try { const err = await res.json(); message = err.message || message; } catch {} throw new Error(message); }
  return res.status === 204 ? (undefined as unknown as T) : res.json();
}
export interface PublicInsights { totals: { jugadores: number; equipos: number; partidos: number; organizaciones: number }; destacados: { jugadores: any[]; partidosRecientes: any[] } }
export interface SolicitudEdicion { id: string; tipo: string; entidad: string; entidadId: string; estado: string }
export const api = {
  insights: () => request<PublicInsights>(`/public/insights`),
  publicJugadores: (page = 1, pageSize = 20) => request<{ data: any[]; meta: any }>(`/public/jugadores?page=${page}&pageSize=${pageSize}`),
  publicEquipos: (page = 1, pageSize = 20) => request<{ data: any[]; meta: any }>(`/public/equipos?page=${page}&pageSize=${pageSize}`),
  register: (payload: { nombre: string; email: string; password: string }) => request<{ user: any; accessToken: string; refreshToken: string }>(`/auth/registro`, { method: 'POST', body: payload }),
  solicitarCrearEntidad: (payload: { tipo: string; nombre: string }) => request<SolicitudEdicion>(`/solicitud-edicion`, { method: 'POST', body: { tipo: `usuario-crear-${payload.tipo}`, entidad: payload.tipo, datosPropuestos: { nombre: payload.nombre } }, auth: true }),
  solicitarAdminEntidad: (payload: { tipo: string; entidadId: string }) => request<SolicitudEdicion>(`/solicitud-edicion`, { method: 'POST', body: { tipo: `usuario-solicitar-admin-${payload.tipo}`, entidad: payload.tipo, entidadId: payload.entidadId }, auth: true }),
};
export default api;
