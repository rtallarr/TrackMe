import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCardData } from "@/lib/card-data";
import { createSnapshot } from "@/lib/snapshots";
import { cookies } from "next/headers";
import type { Game } from "@/lib/steam/types";

async function getSpotifyAccessToken(refreshToken: string) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Missing Spotify credentials");
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }),
        cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok || !data.access_token) {
        throw new Error("Failed to refresh Spotify token");
    }

    return data.access_token as string;
}

async function collectSnapshots(
    userId: string,
    spotifyTimeRange: string,
    chessGameType: string
) {
    const cookieStore = await cookies();
    const snapshots: { id: string; provider: string; blob_path: string }[] = [];
    const spotifyRefreshToken = cookieStore.get("spotify_refresh_token")?.value;
    const lichessAccessToken = cookieStore.get("lichess_access_token")?.value;
    const usernamesCookie = cookieStore.get("usernames")?.value;
    let usernames: Record<string, string> = {};

    if (usernamesCookie) {
        try {
            usernames = JSON.parse(usernamesCookie);
        } catch {
            usernames = {};
        }
    }
    const chessUsername = usernames["Chess.com"];
    const steamId = usernames.Steam;

    if (spotifyRefreshToken) {
        const accessToken = await getSpotifyAccessToken(spotifyRefreshToken);
        const [tracksResponse, artistsResponse] = await Promise.all([
            fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${spotifyTimeRange}&limit=10`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                cache: "no-store",
            }),
            fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${spotifyTimeRange}&limit=10`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                cache: "no-store",
            }),
        ]);

        if (tracksResponse.ok && artistsResponse.ok) {
            const tracksData = await tracksResponse.json();
            const artistsData = await artistsResponse.json();
            const spotify = {
                timeRange: spotifyTimeRange,
                limit: 10,
                artists: (artistsData.items ?? []).map((artist: {
                    id: string;
                    name: string;
                    genres?: string[];
                    popularity?: number;
                    external_urls?: { spotify: string };
                    images?: { url: string }[];
                }) => ({
                    id: artist.id,
                    name: artist.name,
                    genres: artist.genres ?? [],
                    popularity: artist.popularity ?? 0,
                    spotifyUrl: artist.external_urls?.spotify ?? "",
                    imageUrl: artist.images?.[0]?.url ?? null,
                })),
                tracks: (tracksData.items ?? []).map((track: {
                    id: string;
                    name: string;
                    artists?: { name: string }[];
                    album?: {
                        name: string;
                        release_date: string;
                        images?: { url: string }[];
                    };
                    duration_ms: number;
                    popularity?: number;
                    external_urls?: { spotify: string };
                }) => ({
                    id: track.id,
                    name: track.name,
                    artists: (track.artists ?? []).map((artist) => artist.name),
                    album: track.album?.name ?? "",
                    releaseDate: track.album?.release_date ?? "",
                    durationMs: track.duration_ms,
                    popularity: track.popularity ?? 0,
                    spotifyUrl: track.external_urls?.spotify ?? "",
                    imageUrl: track.album?.images?.[0]?.url ?? null,
                })),
            };
            const snapshot = await createSnapshot(userId, "spotify", spotify);
            snapshots.push({ id: snapshot.id, provider: "spotify", blob_path: snapshot.path });
        }
    }

    if (chessUsername) {
        const response = await fetch(
            `https://api.chess.com/pub/player/${encodeURIComponent(chessUsername)}/stats`,
            { cache: "no-store" }
        );
        if (response.ok) {
            const stats = await response.json();
            const chess = stats[`chess_${chessGameType}`];
            const snapshot = await createSnapshot(userId, "chess", {
                mode: chessGameType,
                chessComRating: chess?.last?.rating ?? null,
            });
            snapshots.push({ id: snapshot.id, provider: "chess", blob_path: snapshot.path });
        }
    }

    if (lichessAccessToken) {
        const response = await fetch("https://lichess.org/api/account", {
            headers: { Authorization: `Bearer ${lichessAccessToken}` },
            cache: "no-store",
        });
        if (response.ok) {
            const account = await response.json();
            const games = Object.fromEntries(
                ["bullet", "blitz", "rapid"].map((mode) => [
                    mode,
                    {
                        win: 0,
                        loss: 0,
                        draw: 0,
                        rating: account.perfs?.[mode]?.rating ?? 0,
                    },
                ])
            );
            const snapshot = await createSnapshot(userId, "lichess", games);
            snapshots.push({ id: snapshot.id, provider: "lichess", blob_path: snapshot.path });
        }
    }

    const steamApiKey = process.env.STEAM_API_KEY;
    if (steamId && steamApiKey) {
        const response = await fetch(
            `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${encodeURIComponent(steamApiKey)}&steamid=${encodeURIComponent(steamId)}&include_played_free_games=true&include_appinfo=true&format=json`,
            { cache: "no-store" }
        );
        if (response.ok) {
            const steamData = await response.json();
            const games = (steamData.response?.games ?? [])
                .sort((a: Game, b: Game) => b.playtime_forever - a.playtime_forever)
                .slice(0, 10);
            const snapshot = await createSnapshot(userId, "steam", games);
            snapshots.push({ id: snapshot.id, provider: "steam", blob_path: snapshot.path });
        }
    }

    return snapshots;
}

async function getTodaysSnapshots(userId: string) {
    return sql`
        SELECT DISTINCT ON (provider)
            id,
            provider,
            blob_path
        FROM snapshots
        WHERE user_id = ${userId}
          AND created_at >= CURRENT_DATE
          AND created_at < CURRENT_DATE + INTERVAL '1 day'
        ORDER BY provider, created_at DESC
    `;
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const [existingCard] = await sql`
            SELECT id, slug, created_at
            FROM cards
            WHERE user_id = ${user.id}
              AND created_at >= CURRENT_DATE
              AND created_at < CURRENT_DATE + INTERVAL '1 day'
            ORDER BY created_at DESC
            LIMIT 1
        `;

        if (existingCard) {
            const snapshots = await sql`
                SELECT s.provider, s.blob_path
                FROM card_snapshots cs
                JOIN snapshots s ON s.id = cs.snapshot_id
                WHERE cs.card_id = ${existingCard.id}
            `;

            return NextResponse.json({
                card: existingCard,
                data: await getCardData(snapshots, user.username),
                existing: true,
            });
        }

        const url = new URL(request.url);
        const spotifyTimeRange = url.searchParams.get("spotifyTimeRange") ?? "short_term";
        const chessGameType = url.searchParams.get("chessGameType") ?? "blitz";
        const todaysSnapshots = await getTodaysSnapshots(user.id);
        const snapshots = todaysSnapshots.length > 0
            ? todaysSnapshots
            : await collectSnapshots(user.id, spotifyTimeRange, chessGameType);

        const slug = crypto.randomUUID();

        const [card] = await sql`
            INSERT INTO cards (
                user_id,
                slug
            )
            VALUES (
                ${user.id},
                ${slug}
            )
            RETURNING id, slug, created_at
        `;

        for (const snapshot of snapshots) {
            await sql`
                INSERT INTO card_snapshots (
                    card_id,
                    snapshot_id
                )
                VALUES (
                    ${card.id},
                    ${snapshot.id}
                )
            `;
        }

        return NextResponse.json({
            card,
            data: await getCardData(snapshots, user.username),
            existing: false,
        });
    } catch (error) {
        console.error("Create card error:", error);

        return NextResponse.json(
            { error: "Failed to create card" },
            { status: 500 }
        );
    }
}