// Tipos genéricos para modelar un reglamento oficial completo (Parte -> Sección -> Regla -> Cláusula).
// Pensados para ser portables a otras apps del ecosistema: sin dependencias de contexto/routing,
// solo datos + un componente de renderizado recursivo.

export type FormatoDodgeball = 'cloth' | 'foam';

export interface Clausula {
  /** Número/letra tal como aparece en el documento fuente (ej: "15.1", "(1)", "a."). Vacío si no está numerada. */
  numero: string;
  texto: string;
  hijos?: Clausula[];
}

export interface Regla {
  /** Número de regla (ej: "15"). */
  numero: string;
  titulo: string;
  clausulas: Clausula[];
}

export interface Seccion {
  /** Título de sección dentro de una parte (ej: "Section 2: Throwing"). Opcional: no todas las partes tienen secciones. */
  titulo?: string;
  reglas: Regla[];
}

export interface Parte {
  numero: string;
  titulo: string;
  secciones: Seccion[];
}

export interface Reglamento {
  formato: FormatoDodgeball;
  tituloDocumento: string;
  fuente: string;
  partes: Parte[];
}

// Contenido de la explicación simplificada ("cómo se juega"): redactado propio, no transcripción.
// Cada escena es una animación 3D; el texto solo la encabeza, el detalle lo cuenta la animación
// con sus propias notas paso a paso (ver components/court3d/escenas.ts).
export type CourtMode = 'posiciones' | 'apertura' | 'lanzamiento' | 'catch' | 'bloqueo' | 'linea' | 'gana';

export interface EscenaExplicada {
  id: CourtMode;
  emoji: string;
  titulo: string;
  /** Una sola frase: lo que hay que llevarse de la escena. */
  resumen: string;
}

export interface DiferenciaFormato {
  aspecto: string;
  cloth: string;
  foam: string;
}
