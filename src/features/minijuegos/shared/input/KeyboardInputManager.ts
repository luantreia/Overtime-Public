const PREVENT_DEFAULT_CODES = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'Space', 'ShiftLeft', 'ShiftRight',
]);

/**
 * Generic keyboard state tracker shared across minigames. Exposes raw key
 * state (`isDown`) and one-shot presses (`consumeJustPressed`) — each game
 * maps these primitives into its own input semantics (movement axes, action
 * buttons, etc.) instead of this class knowing about any particular game.
 */
export class KeyboardInputManager {
  private keysDown = new Set<string>();
  private justPressed = new Set<string>();

  constructor(private target: Window = window) {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.target.addEventListener('keydown', this.handleKeyDown as EventListener);
    this.target.addEventListener('keyup', this.handleKeyUp as EventListener);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (PREVENT_DEFAULT_CODES.has(e.code)) e.preventDefault();
    if (!this.keysDown.has(e.code)) this.justPressed.add(e.code);
    this.keysDown.add(e.code);
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keysDown.delete(e.code);
  }

  isDown(code: string): boolean {
    return this.keysDown.has(code);
  }

  consumeJustPressed(code: string): boolean {
    const was = this.justPressed.has(code);
    this.justPressed.delete(code);
    return was;
  }

  destroy() {
    this.target.removeEventListener('keydown', this.handleKeyDown as EventListener);
    this.target.removeEventListener('keyup', this.handleKeyUp as EventListener);
  }
}
