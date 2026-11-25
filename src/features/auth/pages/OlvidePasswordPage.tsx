import { Link } from 'react-router-dom';
import { AuthLayout, ForgotPasswordForm } from 'overtime-kit';
import { solicitarResetPassword } from '../services/authService';

const OlvidePasswordPage = () => (
  <AuthLayout
    marca={<img src="/logo.png" alt="Overtime" className="mb-2 h-20 w-auto" />}
    titulo="Recuperar contraseña"
    pie={
        <Link to="/login" className="font-semibold text-brand-300 underline hover:text-brand-200">
          Volver a iniciar sesión
        </Link>
      }
  >
    <ForgotPasswordForm onSubmit={solicitarResetPassword} />
  </AuthLayout>
);

export default OlvidePasswordPage;
