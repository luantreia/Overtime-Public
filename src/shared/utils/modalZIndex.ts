/**
 * Puente al kit: la pila de z-index vive en `overtime-kit` y este archivo existe sólo para que
 * los overlays hechos a mano que todavía no migraron a `<Overlay>` (varios modales de esta app)
 * sigan pidiendo su z-index sin cambiar el import.
 *
 * Importa mantenerlo como re-export y no como una implementación propia: comparte el mismo
 * contador que usa `<Modal>`/`<Overlay>` del kit, así un modal hecho a mano y uno migrado se
 * siguen apilando en el orden correcto entre sí.
 */
export { getNextModalZIndex } from 'overtime-kit';
