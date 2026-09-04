import type { FlashcardData } from "@/lib/flashcard/types";
import Image from "next/image";

type FlashcardProps = {
  data: FlashcardData;
};

export function Flashcard({ data }: FlashcardProps) {
  return (
    <div className="w-[420px] overflow-hidden rounded-[28px] bg-[#101b17] text-white shadow-2xl">
      <div className="relative overflow-hidden px-7 pb-8 pt-7">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#d5f36b] opacity-90" />
        <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full border-[42px] border-[#275b4c]" />
      </div>

      {data.spotify ? (
        <section className="border-t border-white/10 bg-[#f4f1e8] px-7 py-6 text-[#101b17]">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-black">Spotify</h3>
            <span className="text-xs font-medium text-[#59766b]">
              {data.spotify.timeRange === "short_term"
                ? "Last 4 weeks"
                : data.spotify.timeRange === "medium_term"
                  ? "Last 6 months"
                  : "All time"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="overflow-hidden rounded-2xl bg-[#d5f36b] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#426052]">
                Top song
              </p>
              {data.spotify.topTrack?.imageUrl ? (
                <Image
                  src={data.spotify.topTrack.imageUrl}
                  alt=""
                  width={180}
                  height={180}
                  className="mt-3 aspect-square w-full rounded-xl object-cover"
                />
              ) : null}
              <p className="mt-3 truncate text-sm font-black">
                {data.spotify.topTrack?.name ?? "No data"}
              </p>
              <p className="truncate text-xs text-[#426052]">
                {data.spotify.topTrack?.artist ?? ""}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl bg-[#dce7df] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#59766b]">
                Top artist
              </p>
              {data.spotify.topArtist?.imageUrl ? (
                <Image
                  src={data.spotify.topArtist.imageUrl}
                  alt=""
                  width={180}
                  height={180}
                  className="mt-3 aspect-square w-full rounded-full object-cover"
                />
              ) : null}
              <p className="mt-3 truncate text-sm font-black">
                {data.spotify.topArtist?.name ?? "No data"}
              </p>
              <p className="text-xs text-[#59766b]">On repeat</p>
            </div>
          </div>
        </section>
      ) : null}

      {data.chess ? (
        <section className="border-t border-white/10 bg-[#f4f1e8] px-7 py-6 text-[#101b17]">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-black">Chess</h3>
            <span className="text-xs font-medium text-[#59766b]">
              {data.chess.mode === "blitz"
                ? "Blitz"
                : data.chess.mode === "bullet"
                  ? "Bullet"
                  : "Rapid"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white px-4 py-3">
              <p className="text-xs text-[#59766b]">Chess.com</p>
              <p className="mt-1 text-3xl font-black">
                {data.chess.chessComRating ?? "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3">
              <p className="text-xs text-[#59766b]">Lichess</p>
              <p className="mt-1 text-3xl font-black">
                {data.chess.lichessRating ?? "-"}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {data.steam ? (
        <section className="border-t border-white/10 bg-[#f4f1e8] px-7 pb-7 pt-6 text-[#101b17]">
          <h3 className="mb-3 text-lg font-black">Most played</h3>

          <div className="space-y-1">
            {data.steam.topGames.slice(0, 3).map((game, index) => (
              <div
                key={game.appid}
                className="flex items-center justify-between border-b border-[#dce7df] py-2 last:border-0"
              >
                <span className="min-w-0 truncate pr-3 text-sm font-bold">
                  <span className="mr-2 text-xs text-[#59766b]">0{index + 1}</span>
                  {game.name}
                </span>

                <span className="shrink-0 text-xs font-medium text-[#59766b]">
                  {Math.round(game.playtime_forever / 60)}h
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}