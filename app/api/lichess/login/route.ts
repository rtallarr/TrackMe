import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";

const LICHESS_AUTH_URL = "https://lichess.org/oauth";
const LICHESS_CLIENT_ID = process.env.LICHESS_CLIENT_ID;

const base64UrlEncode = (buffer: Buffer): string =>
  buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

const createCodeVerifier = (): string => {
  return base64UrlEncode(randomBytes(32));
};

const createCodeChallenge = (verifier: string): string => {
  return base64UrlEncode(
    createHash("sha256").update(verifier).digest()
  );
};

export async function GET(req: NextRequest) {
  if (!LICHESS_CLIENT_ID) {
    return NextResponse.json(
      { error: "Missing Lichess client ID" },
      { status: 500 }
    );
  }

  const verifier = createCodeVerifier();
  const challenge = createCodeChallenge(verifier);

  const redirectUri =
    process.env.NODE_ENV !== "production" 
    ? "http://127.0.0.1:3000/api/lichess/callback" : `${req.nextUrl.origin}/api/lichess/callback`;

  const authUrl = new URL(LICHESS_AUTH_URL);

  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", LICHESS_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "preference:read");
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("code_challenge", challenge);

  const response = NextResponse.redirect(authUrl);

  response.cookies.set("lichess_code_verifier", verifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return response;
}