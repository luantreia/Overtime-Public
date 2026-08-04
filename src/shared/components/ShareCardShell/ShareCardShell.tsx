import React, { forwardRef } from 'react';

interface ShareCardShellProps {
  /** CSS aspect-ratio value, e.g. '9 / 16'. Omit for auto-height (content-driven). */
  aspectRatio?: string;
  width?: number;
  children: React.ReactNode;
}

/**
 * Marco visual compartido por las tarjetas de "compartir" (jugador, ranking,
 * comparaciones, partido, etc.): gradiente de marca, stripe superior, glow
 * central y footer con rombo. Cada modal solo aporta su contenido.
 */
export const ShareCardShell = forwardRef<HTMLDivElement, ShareCardShellProps>(
  ({ aspectRatio, width = 320, children }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width,
          aspectRatio,
          borderRadius: 24,
          overflow: 'hidden',
          background: 'linear-gradient(155deg, #2b45db 0%, #4338ca 100%)',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ height: 4, background: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, minHeight: 0 }}>
          {children}
        </div>

        <div style={{ padding: '10px 24px 22px', display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3))' }} />
          <div style={{ width: 6, height: 6, borderRadius: 1, flexShrink: 0, background: 'rgba(255,255,255,0.5)', transform: 'rotate(45deg)' }} />
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.3))' }} />
        </div>
      </div>
    );
  }
);

ShareCardShell.displayName = 'ShareCardShell';
