import type { InputSnapshot } from './types';

const MOVE_KEYS = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'Space', 'ShiftLeft', 'ShiftRight',
]);

export class InputManager {
  private keys = new Set<string>();
  private throwQueued = false;

  constructor(private target: HTMLElement | Window = window) {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.target.addEventListener('keydown', this.handleKeyDown as EventListener);
    this.target.addEventListener('keyup', this.handleKeyUp as EventListener);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (MOVE_KEYS.has(e.code)) e.preventDefault();
    if (e.code === 'Space' && !this.keys.has(e.code)) {
      this.throwQueued = true;
    }
    this.keys.add(e.code);
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keys.delete(e.code);
  }

  getSnapshot(): InputSnapshot {
    let moveX = 0;
    let moveY = 0;
    if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) moveX -= 1;
    if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) moveX += 1;
    if (this.keys.has('ArrowUp') || this.keys.has('KeyW')) moveY -= 1;
    if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) moveY += 1;

    const throwPressed = this.throwQueued;
    this.throwQueued = false;

    const catchHeld = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');

    return { moveX, moveY, throwPressed, catchHeld };
  }

  destroy() {
    this.target.removeEventListener('keydown', this.handleKeyDown as EventListener);
    this.target.removeEventListener('keyup', this.handleKeyUp as EventListener);
  }
}
