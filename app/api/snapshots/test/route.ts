import { sql } from "@/lib/db";
import { createSnapshot } from "@/lib/snapshots";
import { NextResponse } from "next/server";

export async function POST() {
  const users = await sql`
    INSERT INTO users (username)
    VALUES ('blob-test-user')
    ON CONFLICT (username)
    DO UPDATE SET username = EXCLUDED.username
    RETURNING id
  `;

  const userId = users[0].id;

  const data = {
    spotify: {
      topArtist: "Daft Punk",
      topTrack: "Instant Crush",
      minutesListened: 12450,
    },
    chess: {
      rapid: 1420,
      blitz: 1350,
      gamesPlayed: 183,
    },
    createdAt: new Date().toISOString(),
  };

  const snapshot = await createSnapshot(userId, data);

  return NextResponse.json({
    userId,
    snapshot,
  });
}