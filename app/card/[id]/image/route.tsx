import { ImageResponse } from "next/og";
import { getPublicFlashcardData } from "@/lib/flashcard/public";

export const runtime = "edge";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await params;

  const data = await getPublicFlashcardData(id);

  if (!data) {
    return new Response("Card not found", {
      status: 404,
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          background: "#111827",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 700,
          }}
        >
          TrackMe
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            marginTop: 12,
            color: "#9ca3af",
          }}
        >
          My latest stats
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 60,
            gap: 80,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", fontSize: 24 }}>
              Top artist
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              {data.spotify?.topArtist?.name ?? "No data"}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", fontSize: 24 }}>
              Top song
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              {data.spotify?.topTrack?.name ?? "No data"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 70,
            gap: 80,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", fontSize: 24 }}>
              Chess.com
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 48,
                fontWeight: 700,
              }}
            >
              {data.chess?.chessComRating ?? "-"}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", fontSize: 24 }}>
              Lichess
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 48,
                fontWeight: 700,
              }}
            >
              {data.chess?.lichessRating ?? "-"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontSize: 22,
            color: "#9ca3af",
          }}
        >
          trackme
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}