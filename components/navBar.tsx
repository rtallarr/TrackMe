'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/app-menu', label: 'App Menu' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/learn-more', label: 'Learn More' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/75 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-sm font-semibold text-background">
            T
          </div>
          <span className="text-base font-semibold tracking-tight">TrackMe</span>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 p-1 shadow-sm">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={[
                  'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                ].join(' ')}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
