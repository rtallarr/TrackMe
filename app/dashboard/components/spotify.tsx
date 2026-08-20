"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type TopTrack = {
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

type TopArtist = {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  spotifyUrl: string;
  imageUrl: string | null;
};

type SpotifyTopItems = {
  error?: string;
  details?: string;
  limit: number;
  timeRange: string;
  total: number;
  tracks: TopTrack[];
  artists: TopArtist[];
};

const TIME_RANGE_OPTIONS = [
  { value: "short_term", label: "Last 4 weeks" },
  { value: "medium_term", label: "Last 6 months" },
  { value: "long_term", label: "All time" },
];

type SpotifyTopTracksProps = {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
};

export function SpotifyTopTracks({
  timeRange,
  onTimeRangeChange,
}: SpotifyTopTracksProps) {
  const [topItems, setTopItems] = useState<SpotifyTopItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notConnected, setNotConnected] = useState(false);

  useEffect(() => {
    const fetchTop = async () => {
      setLoading(true);
      setError(null);
      setNotConnected(false);

      try {
        const res = await fetch(
          `/api/spotify/top?limit=10&time_range=${timeRange}`,
          {
            cache: "no-store",
          }
        );

        const data = (await res.json()) as SpotifyTopItems;

        if (!res.ok) {
          const message = data.error || "Failed to load Spotify data";
          setError(message);
          if (res.status === 401) {
            setNotConnected(true);
          }
          setTopItems(null);
          return;
        }
        setTopItems(data);
      } catch {
        setError("Network error while loading Spotify data");
        setTopItems(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTop();
  }, [timeRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spotify Top</CardTitle>
        <CardDescription>Top songs and artists from your Spotify account.</CardDescription>
        <div className="pt-2">
          <label className="text-sm" htmlFor="spotify-time-range">
            Time range
          </label>
          <select
            id="spotify-time-range"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={timeRange}
            onChange={(event) => onTimeRangeChange(event.target.value)}
          >
            {TIME_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading Spotify...</p> : null}

        {!loading && notConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Connect to Spotify to see your top tracks and artists.</p>
            <Button asChild>
              <a href="/api/spotify/login">Connect Spotify</a>
            </Button>
          </div>
        ) : null}

        {!loading && !notConnected && error ? <p className="text-sm text-red-500">{error}</p> : null}

        {!loading && !error && topItems?.tracks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No top items available for this period.</p>
        ) : null}
        
        {!loading && topItems?.tracks.length > 0 ? (
          <div className="flex justify-evenly flex-wrap gap-6">
            <ul className="flex-1">
              {topItems?.tracks.map((track, index) => (
                <li key={track.id} className="flex items-center gap-3 rounded-md border p-3 mb-1">
                  {track.imageUrl ? (
                    <Image
                      src={track.imageUrl}
                      alt={track.album}
                      className="h-12 w-12 rounded object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {index + 1}. {track.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {track.artists.join(", ")} - {track.album}
                    </p>
                  </div>
                  <a
                    href={track.spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary underline-offset-4 hover:underline"
                  >
                    Open
                  </a>
                </li>
              ))}
            </ul>
            <ul className="flex-1">
              {topItems?.artists.map((artist, index) => (
                <li key={artist.id} className="flex items-center gap-3 rounded-md border p-3 mb-1">
                  {artist.imageUrl ? (
                    <Image
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="h-12 w-12 rounded object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {index + 1}. {artist.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {artist.genres.join(", ")}
                    </p>
                  </div>
                  <a
                    href={artist.spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary underline-offset-4 hover:underline"
                  >
                    Open
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
