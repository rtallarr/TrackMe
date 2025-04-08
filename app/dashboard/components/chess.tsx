"use client"

import { useState, useEffect, useMemo } from "react"
//import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const chartConfig = {
  wins: {
    label: "Wins",
    color: "var(--chart-1)",
  },
  losses: {
    label: "Losses",
    color: "var(--chart-2)",
  },
  draws: {
    label: "Draws",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function WinRate() {
  interface StatsData {
    [key: string]: {
      record: {
        win: number;
        loss: number;
        draw: number;
      };
    };
  }
  const [selectedMode, setSelectedMode] = useState("blitz")
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [chartData, setChartData] = useState([
    { name: "Wins", value: 0, fill: "var(--chart-2)" },
    { name: "Losses", value: 0, fill: "var(--chart-5)" },
    { name: "Draws", value: 0, fill: "var(--chart-1)" },
  ])

  const totalCount = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [chartData])

  useEffect(() => {
    const appsUsernames = localStorage.getItem("appsUsernames");
    if (appsUsernames) {
      const parsedUsernames = JSON.parse(appsUsernames);
      const chessUsername = parsedUsernames["Chess.com"];

      if (chessUsername) {
        const fetchData = async () => {
          try {
            const response = await fetch(
              `https://api.chess.com/pub/player/${chessUsername}/stats`
            );
            if (!response.ok) throw new Error("Failed to fetch stats");
            const stats = await response.json();
            //console.log("Fetched stats:", stats);
            setStatsData(stats);
          } catch (error) {
            console.error(error);
          }
        };
        fetchData();
      }
    }
  }, []);

  // Update chartData
  useEffect(() => {
    if (!statsData) return
    const modeKey = "chess_" + selectedMode

    const wins = statsData[modeKey]?.record.win || 0;
    const losses = statsData[modeKey]?.record.loss || 0;
    const draws = statsData[modeKey]?.record.draw || 0;

    setChartData([
      { name: "Wins", value: wins, fill: "var(--chart-2)" },
      { name: "Losses", value: losses, fill: "var(--chart-5)" },
      { name: "Draws", value: draws, fill: "var(--chart-1)" },
    ])
  }, [selectedMode, statsData])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Win rate</CardTitle>
        <CardDescription>Chess.com</CardDescription>
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
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalCount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Games
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
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