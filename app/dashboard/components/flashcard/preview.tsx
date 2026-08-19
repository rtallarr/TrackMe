"use client";

import { useState } from "react";
import { Flashcard } from "./flashcard";
import type { FlashcardData } from "@/lib/flashcard/types";

export function FlashcardPreview() {
  const [data, setData] = useState<FlashcardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewFlashcard = async () => {
    setLoading(true);
    setError(null);

    const appsUsernames = localStorage.getItem("appsUsernames");
    const chessUsername = appsUsernames ? JSON.parse(appsUsernames)["Chess.com"] : null;

    try {
      const response = await fetch(`/api/flashcard?chessUsername=${chessUsername}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch flashcard data");
      }

      const flashcardData = (await response.json()) as FlashcardData;

      setData(flashcardData);
    } catch (error) {
      console.error(error);
      setError("Failed to load flashcard");
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={previewFlashcard}
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          {loading ? "Loading..." : "Share"}
        </button>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <Flashcard data={data} />

      <button
        onClick={previewFlashcard}
        disabled={loading}
        className="rounded-md border px-4 py-2"
      >
        {loading ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );
}