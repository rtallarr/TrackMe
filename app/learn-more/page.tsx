import Link from "next/link";

const highlights = [
  {
    title: "Unified tracking",
    description: "See your gaming, chess, wellness, and personal data in one place without switching apps.",
  },
  {
    title: "Actionable insights",
    description: "Turn patterns in your stats into clear trends, rankings, and personal benchmarks.",
  },
  {
    title: "Built around your goals",
    description: "Customize the dashboard to fit what you care about most and keep momentum going.",
  },
];

export default function LearnMorePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(135deg,#020817_0%,#0f172a_35%,#111827_100%)] px-4 py-10 text-foreground">
      <div className="mx-auto max-w-5xl rounded-[28px] border border-white/10 bg-background/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.7)] backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Learn more
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything in one personal dashboard.
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            Back home
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-background p-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Why TrackMe
          </p>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            TrackMe brings together the metrics and milestones that matter to you, helping you stay aware of progress, spot trends, and make smarter decisions across the habits and hobbies you care about most.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/app-menu"
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Get started
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Back to landing page
          </Link>
        </div>
      </div>
    </main>
  );
}