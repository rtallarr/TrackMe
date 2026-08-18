import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type ChessRecord = {
  win: number;
  loss: number;
  draw: number;
};

type LichessActivity = {
  games?: Record<string, ChessRecord>;
};

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("lichess_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Lichess account not connected" },
      { status: 401 }
    );
  }

  const accountResponse = await fetch("https://lichess.org/api/account", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!accountResponse.ok) {
    return NextResponse.json(
      { error: "Failed to fetch Lichess account" },
      { status: accountResponse.status }
    );
  }

  const account = await accountResponse.json();

  const activityResponse = await fetch(`https://lichess.org/api/user/${account.id}/activity`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!activityResponse.ok) {
    const details = await activityResponse.text();
    return NextResponse.json(
      {
        error: "Failed to fetch Lichess activity",
        details,
      },
      { status: activityResponse.status }
    );
  }

  const activity = (await activityResponse.json()) as LichessActivity[];
  const games: Record<string, ChessRecord> = {};

  for (const interval of activity) {
    for (const [mode, record] of Object.entries(interval.games ?? {})) {
      if (!games[mode]) {
        games[mode] = {
          win: 0,
          loss: 0,
          draw: 0,
        };
      }

      games[mode].win += record.win ?? 0;
      games[mode].loss += record.loss ?? 0;
      games[mode].draw += record.draw ?? 0;
    }
  }

  return NextResponse.json({account, games});
}