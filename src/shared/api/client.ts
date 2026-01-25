// Public page API client (reads base URL from env and shares auth keys)
const ACCESS_TOKEN_KEY = 'overtime_token';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

async function request<T>(
  path: string,
  options: { method?: HttpMethod; body?: any; auth?: boolean } = {}
): Promise<T> {
  const { method = 'GET', body, auth = false } = options;
  const headers: Record<string, string> = {};

  // Content-Type only when body is plain object
  const isPlainBody = body !== undefined && !(body instanceof FormData) && !(body instanceof URLSearchParams) && !(body instanceof Blob);
  if (isPlainBody) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isPlainBody ? JSON.stringify(body) : body,
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const ct = res.headers.get('Content-Type') || '';
      if (ct.includes('application/json')) {
        const err = await res.json();
        message = err.message || err.error || message;
      } else {
        const txt = await res.text();
        if (txt) message = txt;
      }
    } catch {}
    throw new Error(message);
  }

  return res.status === 204 ? (undefined as unknown as T) : res.json();
}

export interface PublicInsights {
  totals: { jugadores: number; equipos: number; partidos: number; organizaciones: number };
  destacados: { jugadores: any[]; partidosRecientes: any[] };
}

export interface SolicitudEdicion {
  id: string;
  tipo: string;
  entidad: string;
  entidadId: string;
  estado: string;
}

export const api = {
  insights: () => request<PublicInsights>(`/public/insights`),
  publicJugadores: (page = 1, pageSize = 20) =>
    request<{ data: any[]; meta: any }>(`/public/jugadores?page=${page}&pageSize=${pageSize}`),
  publicEquipos: (page = 1, pageSize = 20) =>
    request<{ data: any[]; meta: any }>(`/public/equipos?page=${page}&pageSize=${pageSize}`),
  register: (payload: { nombre: string; email: string; password: string }) =>
    request<{ user: any; accessToken: string; refreshToken: string }>(`/auth/registro`, {
      method: 'POST',
      body: payload,
    }),
  solicitarCrearEntidad: (payload: { tipo: string; nombre: string }) =>
    request<SolicitudEdicion>(`/solicitud-edicion`, {
      method: 'POST',
      body: {
        tipo: `usuario-crear-${payload.tipo}`,
        entidad: payload.tipo,
        datosPropuestos: { nombre: payload.nombre },
      },
      auth: true,
    }),
  solicitarAdminEntidad: (payload: { tipo: string; entidadId: string }) =>
    request<SolicitudEdicion>(`/solicitud-edicion`, {
      method: 'POST',
      body: {
        tipo: `usuario-solicitar-admin-${payload.tipo}`,
        entidad: payload.tipo,
        entidadId: payload.entidadId,
      },
      auth: true,
    }),
};

export default api;
