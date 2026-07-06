import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { MINIJUEGOS_REGISTRY } from '../registry';

const Minijuegos: React.FC = () => {
  usePageTitle('Minijuegos');

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Minijuegos</h1>
      <p className="text-slate-600 mb-8">Un ratito de dodgeball arcade mientras esperás el próximo partido.</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MINIJUEGOS_REGISTRY.map((game) => (
          <Link
            key={game.slug}
            to={game.path}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all"
          >
            <div className="h-32 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-5xl mb-4">
              {game.emoji}
            </div>
            <h2 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{game.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{game.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Minijuegos;
