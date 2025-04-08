import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const getAuthorizedSteamID = async (): Promise<string> => {
  const cookieStore = await cookies();
  const usernamesCookie = cookieStore.get("usernames")?.value;

  if (!usernamesCookie) return '';

  try {
    const usernames = JSON.parse(usernamesCookie);
    return usernames?.Steam ?? null;
  } catch {
    return '';
  }
};

export async function GET() {
  const steamID = await getAuthorizedSteamID();
  const apiKey = process.env.STEAM_API_KEY;

  if (!steamID || !apiKey) {
    return NextResponse.json({ error: "Unauthorized or missing API key" }, { status: 401 });
  }

  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamID}&format=json`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch owned games" }, { status: 500 });
  }
}