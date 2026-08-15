import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

type SpotifyTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type OAuthStatePayload = {
  nonce: string;
  ts: number;
};

const STATE_MAX_AGE_SECONDS = 60 * 10;

const getRedirectUri = (req: NextRequest): string => {
  if (process.env.NODE_ENV !== "production") {
    return `${process.env.LOCALHOST_URL}/api/spotify/callback`;
  }

  const configuredRedirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (configuredRedirectUri) {
    return configuredRedirectUri;
  }

  return "`${req.nextUrl.origin}/api/spotify/callback`";
};

const isValidSignedState = (state: string, secret: string): boolean => {
  const parts = state.split(".");
  if (parts.length !== 2) return false;

  const [payloadBase64, signature] = parts;
  const expectedSignature = createHmac("sha256", secret).update(payloadBase64).digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf8")) as OAuthStatePayload;
    const now = Math.floor(Date.now() / 1000);
    if (!payload.ts || now - payload.ts > STATE_MAX_AGE_SECONDS) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const authError = req.nextUrl.searchParams.get("error");

  if (authError) {
    return NextResponse.redirect(new URL(`/dashboard?spotify_error=${encodeURIComponent(authError)}`, req.url), 400);
  }

  if (!code) {
    return NextResponse.json(
      {
        error: "Missing Spotify authorization code",
        details: "Callback was reached without a code. This usually means redirect_uri mismatch or callback opened directly.",
        received: {
          error: authError,
          state,
        },
        expectedRedirectUri: getRedirectUri(req),
        requestOrigin: req.nextUrl.origin,
      },
      { status: 400 }
    );
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Missing Spotify client credentials" }, { status: 500 });
  }

  if (!state || !isValidSignedState(state, clientSecret)) {
    return NextResponse.json(
      {
        error: "Invalid OAuth state",
        details: "State is missing, expired, or failed signature validation.",
      },
      { status: 400 }
    );
  }

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(req),
    }),
    cache: "no-store",
  });

  const tokenData = (await tokenResponse.json()) as SpotifyTokenResponse;

  if (!tokenResponse.ok || !tokenData.refresh_token) {
    return NextResponse.json(
      {
        error: "Failed to exchange Spotify authorization code",
        details: tokenData.error_description || tokenData.error || "Unknown Spotify error",
      },
      { status: 500 }
    );
  }

  const response = NextResponse.redirect(new URL("/dashboard?spotify=connected", req.url), 302);

  response.cookies.set("spotify_refresh_token", tokenData.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
