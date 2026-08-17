"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type chessCategory = {
    games: number;
    prog: number;
    rating: number;
    rd: number;
    prov?: boolean;
    rank?: number;
}

type lichessAccount = {
    id: string;
    url: string;
    username: string;
    blocking: boolean;
    count: {
        all: number;
        bookmark: number;
        draw: number;
        import: number;
        loss: number;
        me: number;
        playing: number;
        rated: number;
        win: number;
    }
    createdAt: number;
    disabled?: boolean;
    perfs: Record<string, chessCategory>;
    playtime: {
        total: number;
        tv: number;
        human?: number;
    }
};

export function LichessAccount() {
  const [account, setAccount] = useState<lichessAccount>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notConnected, setNotConnected] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      setLoading(true);
      setError(null);
      setNotConnected(false);

      try {
        const res = await fetch(`/api/lichess/account`, {
          cache: "no-store",
        });

        const data = (await res.json()) as lichessAccount;

        if (!res.ok) {
          const message = "Failed to load Lichess stats";
          setError(message);
          if (res.status === 401) {
            setNotConnected(true);
          }
          setAccount(undefined);;
          return;
        }

        setAccount(data);
      } catch {
        setError("Network error while loading Lichess account");
        setAccount(undefined);;
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spotify Top</CardTitle>
        <CardDescription>Top songs and artists from your Spotify account.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading lichess...</p> : null}

        {!loading && notConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Connect to Spotify to see your top tracks and artists.</p>
            <Button asChild>
              <a href="/api/spotify/login">Connect Spotify</a>
            </Button>
          </div>
        ) : null}

        {!loading && !notConnected && error ? <p className="text-sm text-red-500">{error}</p> : null}

        {!loading && !error && !account ? (
          <p className="text-sm text-muted-foreground">No top items available for this period.</p>
        ) : null}
        
        {!loading && account ? (
          <div className="flex justify-evenly flex-wrap gap-6">
            {account.username}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}