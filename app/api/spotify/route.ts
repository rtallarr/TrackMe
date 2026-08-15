import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type SpotifyTokenResponse = {
	access_token?: string;
	token_type?: string;
	expires_in?: number;
	refresh_token?: string;
	scope?: string;
	error?: string;
	error_description?: string;
};

type SpotifyImage = {
	url: string;
	height: number | null;
	width: number | null;
};

type SpotifyArtist = {
	id: string;
	name: string;
};

type SpotifyTopTrack = {
	id: string;
	name: string;
	popularity: number;
	duration_ms: number;
	external_urls: { spotify: string };
	album: {
		id: string;
		name: string;
		release_date: string;
		images: SpotifyImage[];
	};
	artists: SpotifyArtist[];
};

const VALID_TIME_RANGES = new Set(["short_term", "medium_term", "long_term"]);

const getStoredRefreshToken = async (): Promise<string> => {
	const cookieStore = await cookies();
	const refreshTokenFromCookie = cookieStore.get("spotify_refresh_token")?.value;

	if (refreshTokenFromCookie) {
		return refreshTokenFromCookie;
	}

	return "";
};

const getAccessTokenFromRefreshToken = async (refreshToken: string): Promise<string> => {
	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

	if (!clientId || !clientSecret || !refreshToken) {
		throw new Error("Missing Spotify credentials or refresh token");
	}

	const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

	const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${basicAuth}`,
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		}),
		cache: "no-store",
	});

	const tokenData = (await tokenResponse.json()) as SpotifyTokenResponse;

	if (!tokenResponse.ok || !tokenData.access_token) {
		const errorMessage = tokenData.error_description || tokenData.error || "Unable to refresh Spotify token";
		throw new Error(errorMessage);
	}

	return tokenData.access_token;
};

export async function GET(req: NextRequest) {
	const limitParam = req.nextUrl.searchParams.get("limit");
	const timeRangeParam = req.nextUrl.searchParams.get("time_range") ?? "medium_term";

	const limit = Math.min(Math.max(Number(limitParam ?? "10"), 1), 50); // Default 10, max 50, min 1
	const timeRange = VALID_TIME_RANGES.has(timeRangeParam) ? timeRangeParam : "medium_term";

	if (Number.isNaN(limit)) {
		return NextResponse.json({ error: "Invalid limit. Must be a number between 1 and 50." }, { status: 400 });
	}

	try {
		const refreshToken = await getStoredRefreshToken();
		if (!refreshToken) {
			return NextResponse.json(
				{
					error: "Spotify account not connected",
					details: "Connect to Spotify first",
					connectUrl: "/api/spotify/login",
				},
				{ status: 401 }
			);
		}

		const accessToken = await getAccessTokenFromRefreshToken(refreshToken);

		const topTracksResponse = await fetch(
			`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				cache: "no-store",
			}
		);

		const topTracksData = await topTracksResponse.json();

		if (!topTracksResponse.ok) {
			return NextResponse.json(
				{
					error: "Spotify API request failed",
					details: topTracksData,
				},
				{ status: topTracksResponse.status }
			);
		}

		const tracks = ((topTracksData.items ?? []) as SpotifyTopTrack[]).map((track) => ({
			id: track.id,
			name: track.name,
			artists: track.artists.map((artist) => artist.name),
			album: track.album.name,
			releaseDate: track.album.release_date,
			durationMs: track.duration_ms,
			popularity: track.popularity,
			spotifyUrl: track.external_urls.spotify,
			imageUrl: track.album.images?.[0]?.url ?? null,
		}));

		return NextResponse.json({
			limit,
			timeRange,
			total: tracks.length,
			tracks,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to fetch top Spotify tracks";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
