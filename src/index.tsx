import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './app/providers/AuthContext';
import { ToastProvider } from './shared/components/Toast/ToastProvider';
import { SolicitudesProvider } from './app/providers/SolicitudesContext';

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

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}
