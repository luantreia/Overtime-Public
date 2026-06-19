import { authFetch } from '../../../utils/authFetch';
import type { Usuario } from '../../../types';

type UpdateUsuarioPayload = Pick<Usuario, 'nombre'>;

type UpdatePasswordPayload = {
  passwordActual: string;
  passwordNueva: string;
};

export const actualizarUsuario = (payload: UpdateUsuarioPayload) =>
  authFetch<Usuario>('/usuarios/actualizar', {
    method: 'PUT',
    body: payload,
  });

export const cambiarPassword = (payload: UpdatePasswordPayload) =>
  authFetch<void>('/usuarios/password', {
    method: 'PATCH',
    body: payload,
  });
