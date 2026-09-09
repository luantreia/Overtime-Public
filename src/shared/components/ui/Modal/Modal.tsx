/**
 * Puente al kit. La implementación vive en `overtime-kit` y este archivo existe sólo para que
 * las pantallas que ya importaban desde acá no tengan que cambiar el import.
 *
 * El apilado de z-index que tenía esta app (`modalZIndex.ts`) es hoy la pila del kit; se
 * mantiene como puente porque otros modales de acá siguen pidiendo su z-index ahí directo.
 * Además hereda, de dodgeballmanager: Escape que sólo atiende la capa de arriba, scroll del
 * body liberado recién al cerrar la última capa, pantalla completa en mobile con área segura
 * y botón de cerrar de 44px.
 */
export { Modal as default } from 'overtime-kit';
export type { ModalProps, ModalSize } from 'overtime-kit';
