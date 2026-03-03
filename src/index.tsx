import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './app/providers/AuthContext';
import { ToastProvider } from './shared/components/Toast/ToastProvider';
import { SolicitudesProvider } from './app/providers/SolicitudesContext';

// Versión de build (cambia con cada deploy). Usa REACT_APP_VERSION si la defines en el build, si no cae a la versión del package.
const BUILD_VERSION = process.env.REACT_APP_VERSION || process.env.npm_package_version || 'dev';

// Escudo contra problemas de caché (Pantalla en blanco tras nuevas versiones)
class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    const isChunkLoadError = 
      error?.name === 'ChunkLoadError' || 
      String(error?.message).includes('Failed to fetch') ||
      String(error?.message).includes('Importing a module script failed');

    // Si React detecta que le falta un archivo (porque el usuario tenía caché viejo), 
    // forzamos una recarga FUERTE usando JavaScript para limpiar el error automáticamente.
    if (isChunkLoadError) {
      const isReloaded = sessionStorage.getItem('chunk_failed_reload');
      if (!isReloaded) {
        sessionStorage.setItem('chunk_failed_reload', 'true');
        window.location.reload(); 
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Actualización detectada</h2>
          <p style={{ color: '#64748b', marginTop: '10px' }}>La aplicación se ha actualizado a una nueva versión.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '20px', fontWeight: 'bold' }}>
            Recargar Página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  // Limpieza automática cuando cambia la versión: borra caches y recarga una sola vez.
  try {
    const w = window as any;
    const storedVersion = localStorage.getItem('APP_VERSION');
    const alreadyRefreshed = sessionStorage.getItem('version_cleared') === '1';

    if (storedVersion && storedVersion !== BUILD_VERSION && !alreadyRefreshed) {
      sessionStorage.setItem('version_cleared', '1');
      if ('caches' in w) {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).finally(() => {
          localStorage.setItem('APP_VERSION', BUILD_VERSION);
          w.location.reload();
        });
      } else {
        localStorage.setItem('APP_VERSION', BUILD_VERSION);
        w.location.reload();
      }
    } else if (!storedVersion || storedVersion !== BUILD_VERSION) {
      localStorage.setItem('APP_VERSION', BUILD_VERSION);
    }
  } catch (err) {
    console.warn('Version check failed', err);
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <GlobalErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <SolicitudesProvider>
                <App />
              </SolicitudesProvider>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </GlobalErrorBoundary>
    </React.StrictMode>
  );

  // Eliminar el service worker problemático que genera pantallas en blanco
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
        console.log('Service Worker eliminado para evitar problemas de caché 404.');
      }
    });
  }
}
