import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

/**
 * Redirección de las invitaciones viejas hacia Overtime-Manager.
 *
 * El canje de perfiles se mudó a Manager, que es la app del jugador: acá creaba su cuenta y
 * quedaba parado en el portal de los hinchas, sin acceso a nada de lo suyo.
 *
 * Esta ruta NO se borra. Hay invitaciones ya enviadas por WhatsApp con la URL vieja, y borrarla
 * rompería el onboarding de gente que todavía no llegó a usar el producto — el peor momento
 * posible para una pantalla de error. Los links vencen, pero de a poco: esto se puede sacar
 * recién cuando no quede ninguno vivo.
 */
const ClaimRedirect = () => {
  const { token } = useParams<{ token: string }>();
  const destino = process.env.REACT_APP_MANAGER_URL;

  useEffect(() => {
    if (!destino || !token) return;
    // `replace` y no `assign`: si el jugador vuelve atrás no tiene que caer otra vez acá y
    // rebotar de nuevo.
    window.location.replace(`${destino.replace(/\/$/, '')}/claim/${token}`);
  }, [destino, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur">
        {destino ? (
          <>
            <h1 className="text-xl font-semibold text-white">Te estamos llevando…</h1>
            <p className="mt-2 text-sm text-slate-200/80">
              Reclamar tu perfil ahora se hace desde Overtime Manager.
            </p>
            <a
              href={`${destino.replace(/\/$/, '')}/claim/${token ?? ''}`}
              className="mt-4 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400"
            >
              Continuar
            </a>
          </>
        ) : (
          // Sin la variable configurada no se puede redirigir, y mandar a nadie a una URL
          // inventada es peor que decir la verdad.
          <>
            <h1 className="text-xl font-semibold text-white">No pudimos continuar</h1>
            <p className="mt-2 text-sm text-slate-200/80">
              Reclamar tu perfil se hace desde Overtime Manager. Pedile el link a tu entrenador.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ClaimRedirect;
