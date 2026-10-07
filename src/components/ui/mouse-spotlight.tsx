import { useEffect, useRef } from 'react';

/**
 * A soft radial glow that follows the cursor across the whole page,
 * fixed to the viewport so it doesn't scroll away with the content.
 *
 * Neutral/graphite, not indigo — this is ambient background chrome, and
 * CLAUDE.md's brand-palette rule reserves indigo for actionable elements
 * (buttons, links, the hero accent). Position updates go straight to a
 * CSS custom property via a ref (no React state), so movement never
 * triggers a re-render; a requestAnimationFrame loop lerps toward the
 * latest pointer position for a smooth trail instead of a jumpy 1:1
 * follow. Fades in only after the first real pointer move, so it never
 * flashes at a stale (0,0) position on touch devices that never fire
 * mousemove. Skips the animation loop entirely under
 * prefers-reduced-motion, snapping straight to the latest position
 * instead.
 */
export const MouseSpotlight = () => {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };
    let hasMoved = false;
    let rafId: number | null = null;

    const applyPosition = (x: number, y: number) => {
      el.style.setProperty('--spot-x', `${x}px`);
      el.style.setProperty('--spot-y', `${y}px`);
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      applyPosition(current.x, current.y);
      rafId = requestAnimationFrame(tick);
    };

    const onPointerMove = (e: PointerEvent) => {
      target = { x: e.clientX, y: e.clientY };
      if (!hasMoved) {
        hasMoved = true;
        current = { ...target };
        applyPosition(current.x, current.y);
        el.style.opacity = '1';
        if (!reduceMotion) rafId = requestAnimationFrame(tick);
      } else if (reduceMotion) {
        applyPosition(target.x, target.y);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={elRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none opacity-0 transition-opacity duration-700"
      style={{
        background:
          'radial-gradient(500px circle at var(--spot-x, 50%) var(--spot-y, 50%), hsl(var(--foreground) / 0.06), transparent 70%)',
      }}
    />
  );
};

export default MouseSpotlight;
