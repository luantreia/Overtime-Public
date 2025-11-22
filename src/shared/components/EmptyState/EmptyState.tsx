import React from 'react';

export interface EmptyStateProps {
  message: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon = '📭',
  action,
}) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
      <div className="mb-3 text-4xl">{icon}</div>
      <p className="mb-4 text-slate-600">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
