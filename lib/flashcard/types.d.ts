import { Game } from "@/lib/steam/types"

export type FlashcardGame = {
  opponent: string;
  result: "win" | "loss" | "draw";
  mode: string;
  platform: "Chess.com" | "Lichess";
};

export type FlashcardData = {
  spotify?: {
    timeRange: "short_term" | "medium_term" | "long_term";
    topArtist?: {
      name: string;
      imageUrl?: string;
    } | null;
    topTrack?: {
      name: string;
      artist: string;
      imageUrl: string;
    } | null;
  };

  chess?: {
    mode: "blitz" | "bullet" | "rapid";
    chessComRating?: number;
    lichessRating?: number;
  };

  steam?: {
    topGames: Game[];
  };
};