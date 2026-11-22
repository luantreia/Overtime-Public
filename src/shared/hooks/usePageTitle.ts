import { useEffect } from 'react';

const SITE = 'Overtime Dodgeball';
// Mismos valores que public/index.html (título ≤60 y descripción ~125 caracteres).
const DEFAULT_TITLE = `${SITE} · Ligas, torneos y estadísticas`;
const DEFAULT_DESCRIPTION =
  'Seguí ligas y torneos de dodgeball: fixture, resultados en vivo, tablas de posiciones y estadísticas de equipos y jugadores.';
const DEFAULT_IMAGE = `${window.location.origin}/logo.png`;
const JSON_LD_ID = 'page-jsonld';

export interface PageMeta {
  /** Texto para buscadores y vistas previas al compartir. Ideal: 120–160 caracteres. */
  description?: string;
  /** URL de imagen para la vista previa (escudo, foto, logo). */
  image?: string;
  /** Datos estructurados schema.org (SportsTeam, SportsEvent, Person...). */
  jsonLd?: Record<string, unknown>;
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(data?: Record<string, unknown>) {
  document.getElementById(JSON_LD_ID)?.remove();
  if (!data) return;
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.id = JSON_LD_ID;
  el.text = JSON.stringify({ '@context': 'https://schema.org', ...data });
  document.head.appendChild(el);
}

function apply(title: string, description: string, image: string, jsonLd?: Record<string, unknown>) {
  const url = window.location.origin + window.location.pathname;
  document.title = title;
  setMeta('name', 'description', description);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', image);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image);
  setCanonical(url);
  setJsonLd(jsonLd);
}

/** Recorta a ~160 caracteres sin cortar palabras. */
export function resumir(texto: string, max = 160): string {
  const limpio = texto.replace(/\s+/g, ' ').trim();
  if (limpio.length <= max) return limpio;
  return limpio.slice(0, limpio.lastIndexOf(' ', max - 1)) + '…';
}

/**
 * Título, descripción, imagen y datos estructurados de la página.
 * Al desmontar vuelve a los valores por defecto del sitio.
 */
export function usePageTitle(title?: string, meta: PageMeta = {}) {
  const { description, image } = meta;
  const jsonLdKey = meta.jsonLd ? JSON.stringify(meta.jsonLd) : '';

  useEffect(() => {
    apply(
      title ? `${title} | ${SITE}` : DEFAULT_TITLE,
      description ? resumir(description) : DEFAULT_DESCRIPTION,
      image || DEFAULT_IMAGE,
      jsonLdKey ? JSON.parse(jsonLdKey) : undefined,
    );
    return () => apply(DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_IMAGE);
  }, [title, description, image, jsonLdKey]);
}
