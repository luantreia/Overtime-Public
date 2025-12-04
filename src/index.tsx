import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './app/providers/AuthContext';
import { ToastProvider } from './shared/components/Toast/ToastProvider';
import { SolicitudesProvider } from './app/providers/SolicitudesContext';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <SolicitudesProvider>
              <App />
            </SolicitudesProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
