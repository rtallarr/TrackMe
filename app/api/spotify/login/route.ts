import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomUUID } from "crypto";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_SCOPES = ["user-top-read"];

const getRedirectUri = (req: NextRequest): string => {
  if (process.env.NODE_ENV !== "production") {
    return `${process.env.LOCALHOST_URL}/api/spotify/callback`;
  }

  const configuredRedirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (configuredRedirectUri) {
    return configuredRedirectUri;
  }

  return `${req.nextUrl.origin}/api/spotify/callback`;
};

const createSignedState = (secret: string): string => {
  const payload = {
    nonce: randomUUID(),
    ts: Math.floor(Date.now() / 1000),
  };

  const payloadString = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadString).toString("base64url");
  const signature = createHmac("sha256", secret).update(payloadBase64).digest("base64url");
  return `${payloadBase64}.${signature}`;
};

export async function GET(req: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Missing Spotify client credentials" }, { status: 500 });
  }

  const state = createSignedState(clientSecret);
  const redirectUri = getRedirectUri(req);

  const authUrl = new URL(SPOTIFY_AUTH_URL);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("scope", SPOTIFY_SCOPES.join(" "));
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl, 302);
}
