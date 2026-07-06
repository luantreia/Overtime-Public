export type TouchZone = 'left' | 'right';

/**
 * Mobile-first input primitive: splits an element into a left/right half and
 * reports which half was last tapped/clicked. Uses pointer events so it works
 * uniformly for touch and mouse (useful for testing in a desktop browser).
 */
export class TouchZoneInput {
  private pendingZone: TouchZone | null = null;

  constructor(private target: HTMLElement) {
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.target.addEventListener('pointerdown', this.handlePointerDown);
  }

  private handlePointerDown(e: PointerEvent) {
    const rect = this.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    this.pendingZone = x < rect.width / 2 ? 'left' : 'right';
  }

  /** Returns the last tapped zone since the previous call, then clears it. */
  consumeZone(): TouchZone | null {
    const zone = this.pendingZone;
    this.pendingZone = null;
    return zone;
  }

  destroy() {
    this.target.removeEventListener('pointerdown', this.handlePointerDown);
  }
}
