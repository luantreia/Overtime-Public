import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
    <p className="text-7xl font-black text-brand-600">404</p>
    <h1 className="mt-4 text-2xl font-bold text-slate-900">Página no encontrada</h1>
    <p className="mt-2 text-slate-500">El contenido que buscás no existe o fue movido.</p>
    <Link
      to="/"
      className="mt-8 rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white transition hover:bg-brand-700"
    >
      Volver al inicio
    </Link>
  </div>
);

export default NotFoundPage;
