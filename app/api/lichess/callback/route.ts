import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type LichessTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type LichessUser = {
  id: string;
  username: string;
};

const exchangeCodeForToken = async (
  code: string,
  verifier: string,
  redirectUri: string,
  clientId: string
): Promise<LichessTokenResponse> => {
  const response = await fetch("https://lichess.org/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      client_id: clientId,
      code,
      code_verifier: verifier,
    }),
    cache: "no-store",
  });

  const data = (await response.json()) as LichessTokenResponse;

  if (!response.ok) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Failed to exchange Lichess authorization code"
    );
  }

  return data;
};

const getRedirectUri = (): string => {
  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:3000/api/lichess/callback";
  }

  const configuredRedirectUri = process.env.LICHESS_REDIRECT_URI;

  if (configuredRedirectUri) {
    return configuredRedirectUri;
  }

  throw new Error("LICHESS_REDIRECT_URI is not configured");
};

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/dashboard?lichess_error=${encodeURIComponent(error)}`,
        req.url
      )
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing Lichess authorization code" },
      { status: 400 }
    );
  }

  const clientId = process.env.LICHESS_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Missing Lichess client ID" },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();

  const verifier = cookieStore.get("lichess_code_verifier")?.value;

  if (!verifier) {
    return NextResponse.json(
      {
        error: "Missing PKCE verifier",
        details: "The Lichess login session may have expired.",
      },
      { status: 400 }
    );
  }

  try {
    const tokenData = await exchangeCodeForToken(
      code,
      verifier,
      getRedirectUri(),
      clientId
    );

    if (!tokenData.access_token) {
      return NextResponse.json(
        {
          error: "Failed to get Lichess access token",
          details: tokenData,
        },
        { status: 500 }
      );
    }

    const userResponse = await fetch("https://lichess.org/api/account", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      cache: "no-store",
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch Lichess account",
        },
        { status: userResponse.status }
      );
    }

    const lichessUser = (await userResponse.json()) as LichessUser;

    const dashboardUrl =
    process.env.NODE_ENV !== "production"
        ? "http://127.0.0.1:3000/dashboard?lichess=connected"
        : `${req.nextUrl.origin}/dashboard?lichess=connected`;

    const response = NextResponse.redirect(dashboardUrl);

    response.cookies.set("lichess_access_token", tokenData.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: tokenData.expires_in ?? 60 * 60,
    });

    response.cookies.delete("lichess_code_verifier");

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to connect to Lichess";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}