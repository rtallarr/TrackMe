import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("lichess_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        error: "Lichess account not connected",
      },
      { status: 401 }
    );
  }

  const response = await fetch("https://lichess.org/api/account", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "Failed to fetch Lichess account",
        details: data,
      },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}