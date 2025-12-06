import React, { useState } from 'react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface EloExplanationModalProps {
  trigger?: React.ReactNode;
}

export const EloExplanationModal: React.FC<EloExplanationModalProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer inline-flex items-center">
        {trigger || (
          <button className="text-slate-400 hover:text-brand-600 transition-colors" aria-label="Información sobre el sistema de ranking">
            <InformationCircleIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                  <InformationCircleIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Sistema de Ranking ELO</h3>
                  <p className="text-sm text-slate-500">Cómo calculamos tu puntaje</p>
                </div>
              </div>

              <div className="space-y-6 text-sm text-slate-600">
                <section>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    🎯 ¿Qué es el ELO?
                  </h4>
                  <p className="leading-relaxed">
                    Es un sistema matemático para calcular la habilidad relativa de los jugadores. 
                    Todos comienzan con un rating base de <span className="font-bold text-brand-600">1500 puntos</span>.
                    Ganar partidos aumenta tu rating, y perderlo lo disminuye.
                  </p>
                </section>

                <section className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="font-semibold text-slate-900 mb-3">📊 Factores de Cambio (K-Factor)</h4>
                  <p className="mb-3">
                    La cantidad de puntos que ganas o pierdes depende de tu experiencia y nivel actual:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded mt-0.5">Novatos</span>
                      <span>
                        <strong className="text-slate-900">K=32</strong>: Para tus primeros 30 partidos. Los cambios son más grandes para ubicarte rápido en tu nivel real.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded mt-0.5">Estándar</span>
                      <span>
                        <strong className="text-slate-900">K=24</strong>: Después de 30 partidos, tu rating se estabiliza.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded mt-0.5">Élite</span>
                      <span>
                        <strong className="text-slate-900">K=16</strong>: Si superas los 2400 puntos, los cambios son menores para proteger la precisión en niveles altos.
                      </span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold text-slate-900 mb-2">⚖️ Balance de Equipos</h4>
                  <p className="leading-relaxed mb-2">
                    El sistema considera el <strong>promedio de rating</strong> de ambos equipos.
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>Si ganas contra un equipo <strong>más fuerte</strong>, ganas <strong>más puntos</strong>.</li>
                    <li>Si ganas contra un equipo <strong>más débil</strong>, ganas <strong>menos puntos</strong>.</li>
                    <li>Si pierdes contra un equipo <strong>más fuerte</strong>, pierdes <strong>menos puntos</strong>.</li>
                  </ul>
                </section>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
