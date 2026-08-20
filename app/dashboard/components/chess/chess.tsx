"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { WinRateChart } from "./WinRateChart"
import { ChessRecord } from "@/lib/chess/types"

type ChessComStats = {
  [key: string]: {
    record: ChessRecord;
    last: {
      rating: number;
      date: number;
      rd: number;
    };
  };
};

type LichessStats = {
  games: Record<string, ChessRecord>;
};

type WinRateProps = {
  gameType: string;
  onGameTypeChange: (value: string) => void;
};

export function WinRate({
  gameType,
  onGameTypeChange,
}: WinRateProps) {
  const [chessComStats, setChessComStats] = useState<ChessComStats | null>(null);
  const [lichessStats, setLichessData] = useState<LichessStats | null>(null);
  const [combined, setCombined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notConnected, setNotConnected] = useState(false);

  useEffect(() => {
    const fetchDataChess = async () => {
      const appsUsernames = localStorage.getItem("appsUsernames");

      if (!appsUsernames) {
        return;
      }

      const parsedUsernames = JSON.parse(appsUsernames);
      const chessUsername = parsedUsernames["Chess.com"];

      if (chessUsername) {
        try {
          const response = await fetch(
            `https://api.chess.com/pub/player/${chessUsername}/stats`
          );

          if (!response.ok) {
            setError("Failed to fetch Chess.com stats");
          }

          const stats = (await response.json()) as ChessComStats;

          setChessComStats(stats);
        } catch (error) {
          console.error("Chess.com:", error);
          setChessComStats(null);
        }
      }
    };

    const fetchDataLichess = async () => {
      setLoading(true);
      setError(null);
      setNotConnected(false);

      try {
        const res = await fetch(`/api/lichess/stats`, {
          cache: "no-store",
        });

        const data = (await res.json()) as LichessStats;

        if (!res.ok) {
          const message = "Failed to load Lichess stats";
          setError(message);
          if (res.status === 401) {
            setNotConnected(true);
          }
          setLichessData(null);
          return;
        }
        
        setLichessData(data);
      } catch {
        setError("Network error while loading Lichess account");
        setLichessData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDataChess();
    fetchDataLichess()
  }, []);

  const chessComMode = chessComStats?.[`chess_${gameType}`]
  const chessComData = {
    win: chessComMode?.record.win ?? 0,
    loss: chessComMode?.record.loss ?? 0,
    draw: chessComMode?.record.draw ?? 0,
    rating: chessComMode?.last.rating ?? 0,
  }

  const lichessData = lichessStats?.games[gameType] ?? null;

  const combinedData =
  chessComData && lichessData
    ? {
        win: chessComData.win + lichessData.win,
        loss: chessComData.loss + lichessData.loss,
        draw: chessComData.draw + lichessData.draw,
      }
    : null;

  return (
    <Card className="flex flex-col">
      <CardHeader className="relative items-center pb-0">
        <CardTitle>Chess win rate</CardTitle>
        <CardDescription>Chess wins, losses and draws for chess apps </CardDescription>
        <Select value={gameType} onValueChange={onGameTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bullet">Bullet</SelectItem>
            <SelectItem value="blitz">Blitz</SelectItem>
            <SelectItem value="rapid">Rapid</SelectItem>
          </SelectContent>
        </Select>
        <div className="absolute right-4 top-4 flex items-center gap-2 mb-6">
          <Checkbox id="combine-chess"
            checked={combined}
            onCheckedChange={(checked) => setCombined(checked === true)}
          />
          <label htmlFor="combine-chess" className="text-sm">
            Join data
          </label>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {loading ? <p>Loading data...</p> : null}

        {!loading && !error ? (
          <>
          {combined && combinedData ? (
            <div className="flex justify-center">
              <WinRateChart
                title="Combined"
                description=""
                data={combinedData}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chessComData && (
                <WinRateChart
                  title="Chess.com"
                  description=""
                  data={chessComData}
                />
              )}

              {lichessData && !notConnected ? (
                <WinRateChart
                  title="Lichess"
                  description=""
                  data={lichessData}
                />
              ) : notConnected ? (
                <div className="flex flex-col items-center justify-center p-4">
                  <p className="text-sm text-muted-foreground">
                    Not connected to Lichess
                  </p>
                </div>
              ) : null}
            </div>
          )}
          </>
        ) : null}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {/* <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div> */}
      </CardFooter>
    </Card>
  )
}