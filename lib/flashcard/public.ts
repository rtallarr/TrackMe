import type { FlashcardData } from "./types";

export async function getPublicFlashcardData(id: string) {
  return {
    spotify: {
      timeRange: "short_term",
      topArtist: {
        name: "David Guetta",
        imageUrl:
          "https://i.scdn.co/image/ab6761610000e5ebf150017ca69c8793503c2d4f",
      },
      topTrack: {
        name: "Rechazame",
        artist: "Prince Royce",
        imageUrl:
          "https://i.scdn.co/image/ab67616d0000b273a484690118ec2c7a2e2ae124",
      },
    },

    chess: {
      mode: "blitz",
      chessComRating: 401,
      lichessRating: 909,
    },

    steam: {
      topGames: [
        {
          appid: 252490,
          name: "Rust",
          playtime_forever: 73722,
          playtime_deck_forever: 0,
          playtime_disconnected: 5,
          playtime_linux_forever: 0,
          playtime_mac_forever: 0,
          playtime_windows_forever: 73719,
          rtime_last_played: 1786663630,
        },
        {
          appid: 1258080,
          name: "Shop Titans",
          playtime_forever: 25505,
          playtime_deck_forever: 0,
          playtime_disconnected: 0,
          playtime_linux_forever: 0,
          playtime_mac_forever: 0,
          playtime_windows_forever: 25505,
          rtime_last_played: 1692749677,
        },
        {
          appid: 526870,
          name: "Satisfactory",
          playtime_forever: 10671,
          playtime_deck_forever: 0,
          playtime_disconnected: 6,
          playtime_linux_forever: 0,
          playtime_mac_forever: 0,
          playtime_windows_forever: 10671,
          rtime_last_played: 1749185833,
        },
      ],
    },
  };
}