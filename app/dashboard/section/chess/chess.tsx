"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WinRateChart } from "./WinRateChart"

type ChessRecord = {
  win: number;
  loss: number;
  draw: number;
  //add rating
};

type ChessStats = {
  [key: string]: {
    record: ChessRecord;
  };
};

export function WinRate() {
  const [selectedMode, setSelectedMode] = useState("blitz")
  const [chessComData, setChessComData] = useState<ChessRecord | null>(null);
  const [lichessData, setLichessData] = useState<ChessRecord | null>(null);
  const [statsData, setStatsData] = useState<ChessStats | null>(null);
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
            throw new Error("Failed to fetch Chess.com stats");
          }

          const stats = (await response.json()) as ChessStats;

          const modeKey = `chess_${selectedMode}`;

          setChessComData(stats[modeKey]?.record ?? null);
        } catch (error) {
          console.error("Chess.com:", error);
          setChessComData(null);
        }
      }
    };

    const fetchDataLichess = async () => {
      setLoading(true);
      setError(null);
      setNotConnected(false);

      try {
        const res = await fetch(`/api/lichess/account`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          const message = "Failed to load Lichess stats";
          setError(message);
          if (res.status === 401) {
            setNotConnected(true);
          }
          setLichessData(null);
          return;
        }

        setLichessData(data.games[selectedMode]);
      } catch {
        setError("Network error while loading Lichess account");
        setLichessData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDataChess();
    fetchDataLichess()
  }, [selectedMode]);

  useEffect(() => {
    if (!statsData) return;

    const modeKey = `chess_${selectedMode}`;
    setChessComData(statsData[modeKey]?.record ?? null);
  }, [statsData, selectedMode]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Chess win rate</CardTitle>
        <CardDescription>Chess wins, losses and draws for chess apps </CardDescription>
        <Select value={selectedMode} onValueChange={(value) => setSelectedMode(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bullet">Bullet</SelectItem>
            <SelectItem value="blitz">Blitz</SelectItem>
            <SelectItem value="rapid">Rapid</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chessComData && (
              <WinRateChart
              title="Chess.com"
              description={""}
              data={chessComData}
              />
          )}

          {lichessData && (
              <WinRateChart
              title="Lichess"
              description={""}
              data={lichessData}
              />
          )}
        </div>
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