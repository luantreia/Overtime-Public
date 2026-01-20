import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DetallePartido from '../../../shared/components/DetallePartido';

const PartidoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">ID de partido no proporcionado</p>
          <button 
            onClick={() => navigate('/partidos')} 
            className="text-brand-600 hover:underline"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          ← Volver
        </button>

        <DetallePartido partidoId={id} />
      </div>
    </div>
  );
};

export default PartidoDetalle;
