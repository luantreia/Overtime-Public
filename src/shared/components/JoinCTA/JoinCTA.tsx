import React from 'react';

interface JoinCTAProps {
  message: React.ReactNode;
  className?: string;
}

const JoinCTA: React.FC<JoinCTAProps> = ({ message, className = '' }) => (
  <div className={`bg-brand-50 border border-brand-200 rounded-xl p-4 flex items-start sm:items-center gap-3 ${className}`}>
    <span className="text-xl">🤾</span>
    <p className="text-sm text-brand-800">{message}</p>
  </div>
);

export default JoinCTA;
