import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { FlashcardData } from "@/lib/flashcard/types";
import { Game } from "@/lib/steam/types";

const getSpotifyAccessToken = async (refreshToken: string): Promise<string> => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials");
  }

  const basicAuth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error("Failed to refresh Spotify token");
  }

  return data.access_token;
};

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    const chessGameType = req.nextUrl.searchParams.get("chessGameType") ?? "blitz";
    const spotifyTimeRange = req.nextUrl.searchParams.get("spotifyTimeRange") ?? "short_term";
    const chessUsername = req.nextUrl.searchParams.get("chessUsername");
    const spotifyRefreshToken = cookieStore.get("spotify_refresh_token")?.value;
    const lichessAccessToken = cookieStore.get("lichess_access_token")?.value;
    const usernamesCookie = cookieStore.get("usernames")?.value;
    const steamApiKey = process.env.STEAM_API_KEY;

    let usernames: Record<string, string> = {};

    if (usernamesCookie) {
      try {
        usernames = JSON.parse(usernamesCookie);
      } catch {
        usernames = {};
      }
    }

    const steamID = usernames["Steam"];

    /*
     * Spotify
     */
    let topArtist = null;
    let topTrack = null;

    if (spotifyRefreshToken) {
      const spotifyAccessToken =
        await getSpotifyAccessToken(
          spotifyRefreshToken
        );

      const [tracksResponse, artistsResponse] =
        await Promise.all([
          fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${spotifyTimeRange}&limit=1`,
            {
              headers: {
                Authorization:
                  `Bearer ${spotifyAccessToken}`,
              },
              cache: "no-store",
            }
          ),

          fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${spotifyTimeRange}&limit=1`,
            {
              headers: {
                Authorization:
                  `Bearer ${spotifyAccessToken}`,
              },
              cache: "no-store",
            }
          ),
        ]);

      const tracksData = await tracksResponse.json();
      const artistsData = await artistsResponse.json();

      if (tracksResponse.ok) {
        const track = tracksData.items?.[0];

        if (track) {
          topTrack = {
            name: track.name,
            artist: track.artists?.[0]?.name ?? "",
            imageUrl: track.album?.images?.[0]?.url,
          };
        }
      }

      if (artistsResponse.ok) {
        const artist = artistsData.items?.[0];

        if (artist) {
          topArtist = {
            name: artist.name,
            imageUrl: artist.images?.[0]?.url,
          };
        }
      }
    }

    /*
     * Chess.com
     */
    let chessComRating = null;

    if (chessUsername) {
      const chessResponse = await fetch(
        `https://api.chess.com/pub/player/${encodeURIComponent(chessUsername)}/stats`,
        {
          cache: "no-store",
        }
      );

      if (chessResponse.ok) {
        const chessStats = await chessResponse.json();
        chessComRating = chessStats?.[`chess_${chessGameType}`]?.last?.rating ?? null;
      }
    }

    /*
     * Lichess
     */
    let lichessRating = null;

    if (lichessAccessToken) {
      const lichessResponse = await fetch(
        "https://lichess.org/api/account",
        {
          headers: {
            Authorization:
              `Bearer ${lichessAccessToken}`,
          },
          cache: "no-store",
        }
      );

      if (lichessResponse.ok) {
        const account = await lichessResponse.json();
        lichessRating = account.perfs?.[chessGameType]?.rating ?? null;
      }
    }

    let topGames: Game[] = [];

    if (steamID && steamApiKey) {
      const steamResponse = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${encodeURIComponent(steamApiKey)}&steamid=${encodeURIComponent(steamID)}&include_played_free_games=true&include_appinfo=true&format=json`,
        {
          cache: "no-store",
        }
      );

      if (steamResponse.ok) {
        const steamData = await steamResponse.json();

        topGames = (steamData.response?.games ?? [])
          .sort(
            (a: Game, b: Game) =>
              b.playtime_forever - a.playtime_forever
          )
          .slice(0, 3);
      }
    }

    const flashcardData: FlashcardData = {
      spotify: {
        timeRange: spotifyTimeRange as "short_term" | "medium_term" | "long_term",
        topArtist,
        topTrack,
      },

      chess: {
        mode: chessGameType as "blitz" | "bullet" | "rapid",
        chessComRating,
        lichessRating
      },

      steam: {
        topGames,
      },
    };

    return NextResponse.json(flashcardData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate flashcard data";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}