import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const getUsername = async (): Promise<string> => {
  const cookieStore = await cookies();
  const usernamesCookie = cookieStore.get("usernames")?.value;

  if (!usernamesCookie) return '';

  try {
    const usernames = JSON.parse(usernamesCookie);
    return usernames?.OSRS ?? null;
  } catch {
    return '';
  }
};

export async function GET() {
  const Username = await getUsername();

  if (!Username) {
    return NextResponse.json({ error: "Missing Username" }, { status: 400 });
  }

  const url = `https://secure.runescape.com/m=hiscore_oldschool/index_lite.json?player=${encodeURIComponent(Username)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch account data" }, { status: 500 });
  }
}