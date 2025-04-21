import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          src="/next.svg" // Replace 
          alt="TrackMe logo"
          width={180}
          height={38}
          priority
          className="dark:invert"
        />

        <p className="text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)] tracking-[-.01em] max-w-md">
          TrackMe is your personal dashboard for tracking what matters — from gaming and chess to fitness, music, and more. All your stats. One place.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/appMenu"
            className="rounded-full border border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Get started
          </Link>
          <Link
            href="/learn-more"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
          >
            Learn More
          </Link>
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        <span>© {new Date().getFullYear()} TrackMe</span>
        <a
          href="https://github.com/rtallarr/trackme"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline hover:underline-offset-4"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}