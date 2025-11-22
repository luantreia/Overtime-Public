import React from 'react';

export interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

const variantClasses = {
  error: {
    container: 'border-red-200 bg-red-50',
    title: 'text-red-800',
    message: 'text-red-700',
    button: 'bg-red-100 text-red-700 hover:bg-red-200',
  },
  warning: {
    container: 'border-yellow-200 bg-yellow-50',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
    button: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  },
  info: {
    container: 'border-blue-200 bg-blue-50',
    title: 'text-blue-800',
    message: 'text-blue-700',
    button: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title = 'Error',
  onRetry,
  variant = 'error',
}) => {
  const classes = variantClasses[variant];

  return (
    <div className={`rounded-lg border p-4 ${classes.container}`}>
      <p className={`text-sm font-medium ${classes.title}`}>{title}</p>
      <p className={`text-sm ${classes.message}`}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={`mt-2 rounded px-3 py-1.5 text-xs font-medium transition-colors ${classes.button}`}
        >
          Reintentar
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
