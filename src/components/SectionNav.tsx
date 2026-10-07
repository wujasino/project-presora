import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Sticky in-page navigation for the Landing page's main sections.
 *
 * The page is long by nature — a visitor who wants pricing shouldn't have to
 * scroll past the whole story to reach it. This gives every section a direct
 * jump and shows which one is currently on screen.
 *
 * Two details that matter:
 *
 * - It only appears once the hero is behind you. Showing it immediately would
 *   compete with the hero's own call to action, which is the one thing that
 *   page position is for.
 * - The active section is tracked with IntersectionObserver rather than a
 *   scroll handler, so it costs nothing per frame. `rootMargin` biases the
 *   detection band toward the upper half of the viewport, otherwise the
 *   *next* section lights up while you're still reading the current one.
 */

export interface NavSection {
  id: string;
  label: string;
}

export const SectionNav = ({ sections }: { sections: NavSection[] }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  // Show only after the hero has scrolled away.
  useEffect(() => {
    const hero = document.getElementById('hero-input');
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Track which section is currently on screen.
  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const onScreen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (onScreen[0]) setActiveId(onScreen[0].target.id);
      },
      // Band roughly the top third of the viewport: a section counts as
      // "current" once its start has reached that zone, not when its bottom
      // edge merely peeks in.
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      aria-label="Page sections"
      className={cn(
        // `fixed`, not `sticky`, on purpose: src/index.css sets
        // `overflow-x: hidden` on html (deliberately — see the comment there),
        // which turns those elements into scroll containers and silently
        // breaks `position: sticky` for descendants. The element still
        // rendered and reported the right styles; it just scrolled away
        // instead of sticking. `fixed` sidesteps that without touching a
        // global rule that exists for its own good reason.
        // Sits directly under the fixed h-16 navbar.
        'fixed top-16 inset-x-0 z-30 hidden md:block border-b border-[hsl(var(--glass-border))] bg-background/80 backdrop-blur-xl transition-opacity duration-300',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-1 px-4 py-2 overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => jumpTo(s.id)}
            aria-current={activeId === s.id ? 'true' : undefined}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
              activeId === s.id
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default SectionNav;
