import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { Wordmark } from '@/components/Wordmark';

// lucide-react doesn't ship a TikTok glyph — hand-drawn to match the stroke
// weight/viewBox of the lucide icons it sits next to in the socials row.
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// Same story — no lucide glyph for Discord either. Unlike the hand-drawn
// TikTok stroke icon, Discord's mark only reads as itself when filled
// (it's a solid mascot silhouette, not a line shape), so this one uses the
// brand's own official glyph path with fill="currentColor" instead of a
// stroke outline — same as most social-icon rows mixing line icons with a
// recognizable filled brand mark.
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.369a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.121.1.247.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.83 19.83 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.42-2.157 2.42z" />
  </svg>
);

const LINKS = [
  { label: 'About', to: '/about' },
  { label: 'For Agencies', to: '/agencies' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'API Docs', to: '/docs/api' },
  { label: 'Contact', to: '/contact' },
  { label: 'Status', to: '/status' },
  { label: 'Privacy Policy', to: '/polityka-prywatnosci' },
  { label: 'Terms of Service', to: '/regulamin' },
];

// Only profiles that actually exist. The Twitter/LinkedIn/GitHub entries
// removed here pointed at placeholder handles that were never registered —
// a dead social icon in the footer reads as an abandoned product.
const SOCIALS = [
  { href: 'https://www.instagram.com/presora.app', Icon: Instagram, label: 'Instagram' },
  { href: 'https://www.tiktok.com/@presora.app', Icon: TikTokIcon, label: 'TikTok' },
  { href: 'https://discord.gg/HGyJfCVCGH', Icon: DiscordIcon, label: 'Discord' },
];

export const Footer = () => {
  return (
    <footer className="border-t border-[hsl(var(--glass-border))] bg-card/20 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 w-fit shrink-0">
          <Wordmark className="text-2xl" />
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {SOCIALS.map(({ href, Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-9 h-9 rounded-xl border border-[hsl(var(--glass-border))] bg-card/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[hsl(var(--glass-border))] text-center">
        <p className="text-xs text-muted-foreground">© 2026 Presora. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
