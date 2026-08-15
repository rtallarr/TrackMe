import Link from "next/link";

const featureItems = [
  "Gaming dashboards",
  "Chess and performance tracking",
  "Fitness and wellness data",
  "Music and personal stats",
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(135deg,#020817_0%,#0f172a_35%,#111827_100%)] px-4 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="trackme-heading"
        className="relative w-full max-w-4xl rounded-[28px] border border-white/10 bg-background/80 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.7)] backdrop-blur-xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-lg font-semibold text-background">
              T
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">TrackMe</p>
              <p className="text-xs text-muted-foreground">Your stats, in one place</p>
            </div>
          </div>
          <div className="rounded-full border border-border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Welcome
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1.3fr_0.7fr] md:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Personal dashboard
            </p>
            <h1
              id="trackme-heading"
              className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
            >
              Track everything that matters.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              TrackMe is your personal dashboard for tracking what matters, from gaming and chess to fitness, music, and more. All your stats. One place.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app-menu"
                className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Get started
              </Link>
              <Link
                href="/learn-more"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Learn more
              </Link>
            </div>
          </div>

          <aside
            id="features"
            className="rounded-2xl border border-border bg-card p-4 shadow-inner shadow-black/5"
          >
            <p className="text-sm font-medium text-foreground">Included in your dashboard</p>
            <ul className="mt-4 space-y-3">
              {featureItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background/80 px-3 py-2 text-sm text-muted-foreground"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-bold text-emerald-500">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <footer className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-border pt-5 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} TrackMe</span>
          <a
            href="https://github.com/rtallarr/trackme"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </footer>
      </section>
    </main>
  );
}