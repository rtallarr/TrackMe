import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const steamID = req.nextUrl.searchParams.get("steamId");
  const appID = req.nextUrl.searchParams.get("appId");

  const apiKey = process.env.STEAM_API_KEY;
  if (!steamID || !apiKey || !appID) {
    return NextResponse.json({ error: "Missing steamId, appId or API key " }, { status: 400 });
  }

  const url = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${appID}&key=${apiKey}&steamid=${steamID}&format=json`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch Steam data" }, { status: 500 });
  }
}