import { cn } from '@/lib/utils';

// The new mark's glyph is a dark charcoal color (~rgb(50,51,56)) with no
// theme variance of its own — on the app's dark backgrounds that's under a
// 2:1 contrast ratio against ~rgb(17,24,39), effectively invisible. Unlike
// the old indigo glyph (readable on both themes, no swap needed), this one
// needs a light-on-dark recolor for dark mode: two transparent-background
// PNGs (public/presora-mark-new.png charcoal-on-transparent, public/
// presora-mark-new-dark.png the same shape recolored to the app's
// --foreground) swapped via Tailwind's dark: variant, mirroring
// useFaviconTheme.ts's light/dark favicon swap.
//
// Both files are 256x256 — downsized from the original 512x512 masked
// exports (still ~89 KB combined at 512, since both light/dark variants
// download regardless of which one the `dark:` class hides). The largest
// real render size anywhere in the app is Login/Register's `text-3xl`
// lockup at ~66px, so 256px gives ~4x headroom for retina/3x-DPI screens
// with room to spare — verified with no visible blur at 3x device scale.
// Re-derive from the 512px masked source (see the note in CLAUDE.md on
// this mark) rather than re-compressing this file if it ever needs to
// change.
const MARK_LIGHT = '/presora-mark-new.png';
const MARK_DARK = '/presora-mark-new-dark.png';

/** The Presora app icon — woven "p" mark, light/dark aware. */
const Mark = ({ className }: { className?: string }) => (
  <span className={cn('relative shrink-0 inline-block', className)}>
    <img
      src={MARK_LIGHT}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-contain dark:hidden"
    />
    <img
      src={MARK_DARK}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-contain hidden dark:block"
    />
  </span>
);

interface WordmarkProps {
  className?: string;
  /** Render only the mark, no "presora" text — used in collapsed nav states. */
  iconOnly?: boolean;
}

/**
 * Brand lockup used across the app in place of a text-only logo.
 * Size/alignment is controlled by the caller via `className`.
 */
export const Wordmark = ({ className, iconOnly }: WordmarkProps) => {
  if (iconOnly) {
    return <Mark className={cn('h-6 w-6', className)} />;
  }
  return (
    <span className={cn('inline-flex items-center gap-2 font-wordmark font-semibold tracking-wide text-foreground uppercase text-xl', className)}>
      <Mark className="h-[2.2em] w-[2.2em]" />
      <span className="leading-none">presora</span>
    </span>
  );
};

export default Wordmark;
