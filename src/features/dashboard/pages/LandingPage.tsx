import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthContext';
import api, { PublicInsights } from '../../../shared/api/client';
import { PartidoService, Partido } from '../../partidos/services/partidoService';
import { CompetenciaService, Competencia } from '../../competencias/services/competenciaService';
import PartidoCard from '../../../shared/components/PartidoCard';
import { CompetenciaCard } from '../../../shared/components';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [insights, setInsights] = useState<PublicInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [partidosRecientes, setPartidosRecientes] = useState<Partido[]>([]);
  const [partidosProximos, setPartidosProximos] = useState<Partido[]>([]);
  const [competencias, setCompetencias] = useState<Competencia[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [insightsData, recientes, proximos, comps] = await Promise.all([
          api.insights(),
          PartidoService.getFinalizados(),
          PartidoService.getProximos(),
          CompetenciaService.getAll()
        ]);
        
        if (!mounted) return;
        setInsights(insightsData);
        setPartidosRecientes(recientes.slice(0, 10));
        setPartidosProximos(proximos.slice(0, 10));
        setCompetencias(comps);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Error cargando datos');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold sm:text-5xl">
            Overtime Dodgeball
          </h1>
          <p className="mb-8 text-xl text-slate-300">
            Ecosistema competitivo y comunitario de dodgeball
          </p>

          {!isAuthenticated ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="rounded-lg bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700"
              >
                Únete a la comunidad
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/perfil"
                className="rounded-lg bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700"
              >
                Ir a mi perfil
              </Link>
              <Link
                to="/jugadores"
                className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Explorar
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* partidos recientes Section (10partidos) */}    
      <section className="px-4 py-12 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Resultados Recientes</h2>
            <Link to="/partidos" className="text-brand-600 hover:text-brand-700 font-medium">
              Ver todos →
            </Link>
          </div>
          
          {partidosRecientes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {partidosRecientes.map(partido => (
                <PartidoCard 
                  key={partido.id || partido._id} 
                  partido={partido} 
                  variante="resultado" 
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No hay resultados recientes.</p>
          )}
        </div>
      </section>

      {/* Proximos partidos Section (10partidos)*/}
      <section className="px-4 py-12 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Próximos Partidos</h2>
            <Link to="/partidos" className="text-brand-600 hover:text-brand-700 font-medium">
              Ver calendario →
            </Link>
          </div>
          
          {partidosProximos.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {partidosProximos.map(partido => (
                <PartidoCard 
                  key={partido.id || partido._id} 
                  partido={partido} 
                  variante="proximo" 
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No hay partidos programados próximamente.</p>
          )}
        </div>
      </section>

      {/* competencias Section */}
      <section className="px-4 py-12 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Competencias</h2>
            <Link to="/competencias" className="text-brand-600 hover:text-brand-700 font-medium">
              Ver todas →
            </Link>
          </div>
          
          {competencias.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {competencias.map(competencia => (
                <CompetenciaCard 
                  key={competencia.id || competencia._id} 
                  competencia={competencia} 
                  variante={competencia.estado as any || 'proximamente'} 
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No hay competencias activas.</p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">¿Qué puedes hacer?</h2>
            <p className="text-lg text-slate-600">Descubre todas las funcionalidades disponibles</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Explorar contenido"
              description="Navega por jugadores, equipos, competencias y partidos. Toda la información está disponible públicamente."
              icon="🔍"
              available={!isAuthenticated}
            />

            <FeatureCard
              title="Crear solicitudes"
              description="Solicita la creación de nuevos jugadores, equipos o competencias. Todas las solicitudes son revisadas por administradores."
              icon="📝"
              available={isAuthenticated}
            />

            <FeatureCard
              title="Administrar entidades"
              description="Si eres representante de un jugador, equipo u organización, puedes solicitar permisos de administración."
              icon="⚙️"
              available={isAuthenticated}
            />

            <FeatureCard
              title="Participar en competencias"
              description="Únete a competencias existentes o crea nuevas. Forma parte de la comunidad competitiva."
              icon="🏆"
              available={isAuthenticated}
            />

            <FeatureCard
              title="Ver estadísticas"
              description="Accede a estadísticas detalladas de partidos, sets y rendimiento de jugadores y equipos."
              icon="📊"
              available={!isAuthenticated}
            />

            <FeatureCard
              title="Gestionar perfil"
              description="Actualiza tu información personal y gestiona tus solicitudes desde tu perfil de usuario."
              icon="👤"
              available={isAuthenticated}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-brand-600 px-4 py-16 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold">¿Listo para participar?</h2>
            <p className="mb-8 text-xl text-brand-100">
              Únete a la comunidad de Overtime Dodgeball y forma parte del ecosistema competitivo
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="rounded-lg bg-white px-8 py-3 font-semibold text-brand-600 transition hover:bg-slate-50"
              >
                Registrarme ahora
              </Link>
              <Link
                to="/jugadores"
                className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold backdrop-blur transition hover:bg-white/20"
              >
                Explorar primero
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon }: { label: string; value: number; icon: string }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
    <div className="mb-2 text-3xl">{icon}</div>
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
  </div>
);

const FeatureCard = ({
  title,
  description,
  icon,
  available
}: {
  title: string;
  description: string;
  icon: string;
  available: boolean;
}) => (
  <div className={`rounded-lg border p-6 ${available ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'}`}>
    <div className="mb-4 text-3xl">{icon}</div>
    <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
    <p className="text-slate-600">{description}</p>
    {!available && (
      <div className="mt-4">
        <Link
          to="/register"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Regístrate para acceder →
        </Link>
      </div>
    )}
  </div>
);

export default LandingPage;
