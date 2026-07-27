import { useState, type RefObject } from 'react';
import { toPng } from 'html-to-image';

interface UseShareImageOptions {
  filename: string;
  shareTitle?: string;
}

/**
 * Genera un PNG a partir de un nodo del DOM y ofrece compartirlo (navigator.share, con
 * selector nativo de apps en mobile) o descargarlo directamente. Centraliza el patrón
 * que antes cada modal de "compartir" reimplementaba con comportamiento inconsistente.
 */
export function useShareImage(ref: RefObject<HTMLElement | null>, { filename, shareTitle }: UseShareImageOptions) {
  const [loadingShare, setLoadingShare] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);

  const generatePng = async (): Promise<{ dataUrl: string; blob: Blob } | null> => {
    if (!ref.current) return null;
    const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 2, skipFonts: true });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return { dataUrl, blob };
  };

  const handleShare = async () => {
    setLoadingShare(true);
    try {
      const result = await generatePng();
      if (!result) return;
      const { dataUrl, blob } = result;
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: shareTitle });
      } else {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') console.error('Error compartiendo:', err);
    } finally {
      setLoadingShare(false);
    }
  };

  const handleDownload = async () => {
    setLoadingDownload(true);
    try {
      const result = await generatePng();
      if (!result) return;
      const link = document.createElement('a');
      link.download = filename;
      link.href = result.dataUrl;
      link.click();
    } catch (err) {
      console.error('Error descargando:', err);
    } finally {
      setLoadingDownload(false);
    }
  };

  return { handleShare, handleDownload, loadingShare, loadingDownload };
}
