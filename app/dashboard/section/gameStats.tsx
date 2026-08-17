"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"


const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

type props = {
	appId: string
	steamId: string
}

type Game = {
  appid: number;
  playtime_deck_forever: number;
  playtime_disconnected: number;
  playtime_forever: number;
  playtime_linux_forever: number;
  playtime_mac_forever: number;
  playtime_windows_forever: number;
  rtime_last_played: number;
}

export function GameStats({ appId, steamId }: props) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/steam/user-stats');
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await res.json();

        const formattedData = data.response.games
          .filter((game: Game) => game.playtime_forever > 0)
          .sort((a: Game, b: Game) => b.playtime_forever - a.playtime_forever)
          .slice(0, 20);

        const chartFormattedData = formattedData.map((game: Game) => ({
          name: game.appid,
          playtime: game.playtime_forever,
        }));

        setChartData(chartFormattedData);
      } catch (error) {
        console.error("Error fetching game stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [appId, steamId]);

  if (isLoading) {
    return <p>Loading game stats...</p>;
  }
	
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game name</CardTitle>
        <CardDescription>Stats</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              top: 0,
              right: 0,
              bottom: 10,
              left: 0,
            }}
            height={500}
          >
            <XAxis type="number" dataKey="playtime" />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={1}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="playtime" fill="var(--color-desktop)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}