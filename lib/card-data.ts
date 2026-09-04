import { get } from "@vercel/blob";
import type { FlashcardData } from "@/lib/flashcard/types";
import type { SpotifyArtist, SpotifyTrack } from "@/lib/spotify/types";
import type { Game } from "@/lib/steam/types";
import type { ChessRecord } from "@/lib/chess/types";

export type SnapshotRow = {
  id: string;
  provider: string;
  blob_path: string;
};

type SpotifySnapshot = {
  timeRange?: string;
  artists?: SpotifyArtist[];
  tracks?: SpotifyTrack[];
};

export async function getCardData(
  snapshots: SnapshotRow[],
  username: string
): Promise<FlashcardData> {
  const data: FlashcardData = { username };

  for (const snapshot of snapshots) {
    const result = await get(snapshot.blob_path, { access: "private" });

    if (!result) {
      console.error(
        `Failed to fetch snapshot data for provider ${snapshot.provider} at path ${snapshot.blob_path}`
      );
      continue;
    }

    const snapshotData = JSON.parse(
      await new Response(result.stream).text()
    );

    if (snapshot.provider === "spotify") {
      const spotify = snapshotData as SpotifySnapshot;
      const artists = spotify.artists ?? [];
      const tracks = spotify.tracks ?? [];

      data.spotify = {
        timeRange: (spotify.timeRange ?? "short_term") as
          | "short_term"
          | "medium_term"
          | "long_term",
        topArtist: artists[0]
          ? {
              name: artists[0].name,
              imageUrl: artists[0].imageUrl ?? undefined,
            }
          : null,
        topTrack: tracks[0]
          ? {
              name: tracks[0].name,
              artist: tracks[0].artists.join(", "),
              imageUrl: tracks[0].imageUrl ?? "",
            }
          : null,
      };
    }

    if (snapshot.provider === "steam") {
      data.steam = { topGames: snapshotData as Game[] };
    }

    if (snapshot.provider === "chess") {
      const chess = snapshotData as {
        mode?: "blitz" | "bullet" | "rapid";
        chessComRating?: number | null;
        lichessRating?: number | null;
      };

      data.chess = {
        mode: chess.mode ?? "blitz",
        chessComRating: chess.chessComRating ?? undefined,
        lichessRating: chess.lichessRating ?? undefined,
      };
    }

    if (snapshot.provider === "lichess") {
      const games = snapshotData as Record<string, ChessRecord>;
      const mode = data.chess?.mode ?? "blitz";
      const rating = games[mode]?.rating;

      data.chess = {
        mode,
        chessComRating: data.chess?.chessComRating,
        lichessRating: rating,
      };
    }
  }

  return data;
}