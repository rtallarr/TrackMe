import { notFound } from "next/navigation";
import Image from "next/image";

type SpotifyArtist = {
    id: string;
    name: string;
    genres: string[];
    popularity: number;
    spotifyUrl: string;
    imageUrl: string | null;
};

type SpotifyTrack = {
    id: string;
    name: string;
    artists: string[];
    album: string;
    releaseDate: string;
    durationMs: number;
    popularity: number;
    spotifyUrl: string;
    imageUrl: string | null;
};

type SpotifySnapshot = {
    timeRange: string;
    limit: number;
    artists: SpotifyArtist[];
    tracks: SpotifyTrack[];
};

type CardResponse = {
    card: {
        id: string;
        slug: string;
        createdAt: string;
    };
    data: {
        spotify?: SpotifySnapshot;
    };
};

type PageProps = {
    params: Promise<{
        slug: string;
    }>;
};

const TIME_RANGE_LABELS: Record<string, string> = {
    short_term: "Last 4 weeks",
    medium_term: "Last 6 months",
    long_term: "All time",
};

export default async function CardPage({ params }: PageProps) {
    const { slug } = await params;

    const baseUrl = process.env.LOCALHOST_URL ?? "http://127.0.0.1:3000";

    const response = await fetch(
        `${baseUrl}/api/card/${encodeURIComponent(slug)}`,
        {
            cache: "no-store",
        }
    );

    if (response.status === 404) {
        notFound();
    }

    if (!response.ok) {
        throw new Error("Failed to load card");
    }

    const { card, data } = (await response.json()) as CardResponse;

    const spotify = data.spotify;

    return (
        <main className="min-h-screen bg-background px-4 py-10">
            <div className="mx-auto max-w-5xl">

                {/* Card */}
                <div className="overflow-hidden rounded-3xl border bg-card shadow-xl">

                    {/* Header */}
                    <header className="border-b px-6 py-6 sm:px-10">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    TRACKME
                                </p>

                                <h1 className="mt-1 text-3xl font-bold tracking-tight">
                                    My Stats
                                </h1>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    My latest music and gaming stats
                                </p>
                            </div>

                            <div className="rounded-full border px-4 py-2 text-xs font-medium">
                                Shared Card
                            </div>
                        </div>
                    </header>

                    {/* Spotify */}
                    {spotify ? (
                        <section className="px-6 py-8 sm:px-10">

                            <div className="mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                                        <span className="text-lg">
                                            ♪
                                        </span>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            Spotify
                                        </h2>

                                        <p className="text-sm text-muted-foreground">
                                            {TIME_RANGE_LABELS[
                                                spotify.timeRange
                                            ] ?? spotify.timeRange}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-8 lg:grid-cols-2">

                                {/* Artists */}
                                <div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-semibold">
                                            Top Artists
                                        </h3>

                                        <span className="text-xs text-muted-foreground">
                                            {spotify.artists.length}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {spotify.artists.map(
                                            (artist, index) => (
                                                <div
                                                    key={artist.id}
                                                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
                                                >
                                                    <span className="w-5 text-center text-sm font-medium text-muted-foreground">
                                                        {index + 1}
                                                    </span>

                                                    {artist.imageUrl ? (
                                                        <Image
                                                            src={
                                                                artist.imageUrl
                                                            }
                                                            alt={
                                                                artist.name
                                                            }
                                                            width={48}
                                                            height={48}
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-lg bg-muted" />
                                                    )}

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">
                                                            {artist.name}
                                                        </p>

                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {artist.genres
                                                                .slice(0, 2)
                                                                .join(
                                                                    " · "
                                                                )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Tracks */}
                                <div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-semibold">
                                            Top Tracks
                                        </h3>

                                        <span className="text-xs text-muted-foreground">
                                            {spotify.tracks.length}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {spotify.tracks.map(
                                            (track, index) => (
                                                <div
                                                    key={track.id}
                                                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
                                                >
                                                    <span className="w-5 text-center text-sm font-medium text-muted-foreground">
                                                        {index + 1}
                                                    </span>

                                                    {track.imageUrl ? (
                                                        <Image
                                                            src={
                                                                track.imageUrl
                                                            }
                                                            alt={
                                                                track.album
                                                            }
                                                            width={48}
                                                            height={48}
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-lg bg-muted" />
                                                    )}

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">
                                                            {track.name}
                                                        </p>

                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {track.artists.join(
                                                                ", "
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {/* Footer */}
                    <footer className="border-t px-6 py-5 sm:px-10">
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-xs text-muted-foreground">
                                TrackMe · Shared stats
                            </p>

                            <p className="text-xs text-muted-foreground">
                                {new Date(
                                    card.createdAt
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </footer>
                </div>

            </div>
        </main>
    );
}