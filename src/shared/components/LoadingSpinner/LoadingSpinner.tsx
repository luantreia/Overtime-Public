import React from 'react';

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-12 w-12 border-4',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  size = 'md',
  fullScreen = false,
}) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className={`mb-3 inline-block animate-spin rounded-full border-slate-200 border-t-blue-600 ${sizeClasses[size]}`}></div>
        {message && <p className="text-slate-600">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
