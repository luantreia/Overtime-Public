import React from 'react';
import { useParams } from 'react-router-dom';
import DetallePartido from '../../../shared/components/DetallePartido';
import { BackButton } from '../../../shared/components';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

const PartidoDetalle: React.FC = () => {
  usePageTitle('Partido');
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">ID de partido no proporcionado</p>
          <BackButton fallback="/partidos" label="Volver a la lista" className="justify-center" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <BackButton fallback="/partidos" className="mb-6" />

        <DetallePartido partidoId={id} />
      </div>
    </div>
  );
};

export default PartidoDetalle;
