"use client";

import { Playtime } from "@/app/dashboard/components/steam";
import { SpotifyTopTracks } from "./components/spotify";
import { WinRate } from "./components/chess/chess";
import { FlashcardPreview } from "@/app/dashboard/components/flashcard/preview";
import { useEffect, useState } from "react";

type Usernames = {
  Steam?: string;
  OSRS?: string;
  "Chess.com"?: string;
};

export default function Page() {
  const [usernames, setUsernames] = useState<Usernames | null>(null);
  const [spotifyTimeRange, setSpotifyTimeRange] = useState("short_term");
  const [chessGameType, setChessGameType] = useState("blitz");

  useEffect(() => {
    const storedUsernames = localStorage.getItem("appsUsernames");

    if (!storedUsernames) {
      return;
    }

    try {
      setUsernames(JSON.parse(storedUsernames));
    } catch (error) {
      console.error("Error parsing usernames:", error);
    }
  }, []);

  return (
    <div className="py-8 px-4 md:px-8 lg:px-16 xl:px-32">
      <FlashcardPreview
        spotifyTimeRange={spotifyTimeRange}
        chessGameType={chessGameType}
      />
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        <div className="flex-2">
          <SpotifyTopTracks
            timeRange={spotifyTimeRange}
            onTimeRangeChange={setSpotifyTimeRange}
          />
        </div>

        <div className="flex-1">
          {usernames?.["Chess.com"] ? (
            <WinRate
              gameType={chessGameType}
              onGameTypeChange={setChessGameType}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        {usernames && usernames["Steam"] ? <Playtime steamId={usernames["Steam"]} /> : null}
      </div>
    </div>
  );
}