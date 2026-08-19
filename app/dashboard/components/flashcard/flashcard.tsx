import type { FlashcardData } from "@/lib/flashcard/types";

type FlashcardProps = {
  data: FlashcardData;
};

export function Flashcard({ data }: FlashcardProps) {
  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">TrackMe</h2>
        <p className="text-sm text-muted-foreground">
          Your stats at a glance
        </p>
      </div>

      {data.spotify ? (
        <section className="mb-6">
          <div className="mb-3 flex items-baseline gap-2">
            <h3 className="font-semibold">Spotify</h3>
            <span className="text-xs text-muted-foreground">
              {data.spotify.timeRange === "short_term"
                ? "Last 4 weeks"
                : data.spotify.timeRange === "medium_term"
                  ? "Last 6 months"
                  : "All time"}
            </span>
          </div>
          <p>
            <span className="text-muted-foreground">Top song:</span>{" "}
            {data.spotify.topTrack?.name ?? "No data"}
          </p>
          <p>
            <span className="text-muted-foreground">Top artist:</span>{" "}
            {data.spotify.topArtist?.name ?? "No data"}
          </p>
        </section>
      ) : null}

      {data.chess ? (
        <section className="mb-6">
          <div className="mb-3 flex items-baseline gap-2">
            <h3 className="font-semibold">Chess</h3>
            <span className="text-xs text-muted-foreground">
              {data.chess.mode === "blitz"
                ? "Blitz"
                : data.chess.mode === "bullet"
                  ? "Bullet"
                  : "Rapid"}
            </span>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Chess.com</p>
              <p className="text-2xl font-bold">
                {data.chess.chessComRating ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Lichess</p>
              <p className="text-2xl font-bold">
                {data.chess.lichessRating ?? "-"}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {data.steam ? (
        <section>
          <h3 className="mb-3 font-semibold">Top Games</h3>

          <div className="space-y-2">
            {data.steam.topGames.slice(0, 3).map((game, index) => (
              <div
                key={game.appid}
                className="flex items-center justify-between"
              >
                <span>
                  {index + 1}. {game.name}
                </span>

                <span className="text-sm text-muted-foreground">
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