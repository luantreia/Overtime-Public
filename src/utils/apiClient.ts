const ACCESS_TOKEN_KEY = 'overtime_token';
const REFRESH_TOKEN_KEY = 'overtime_refresh_token';

export function getAuthTokens() {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function setAuthTokens({ accessToken, refreshToken }: { accessToken: string | null, refreshToken: string | null }) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export { authFetch as fetchWithAuth } from '../shared/utils copy/authFetch';