"use client";

import { useState } from "react";
import { Flashcard } from "./flashcard";
import type { FlashcardData } from "@/lib/flashcard/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type FlashcardPreviewProps = {
  spotifyTimeRange: string;
  chessGameType: string;
};

export function FlashcardPreview({
  spotifyTimeRange,
  chessGameType,
}: FlashcardPreviewProps) {
  const [data, setData] = useState<FlashcardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const previewFlashcard = async () => {
    setLoading(true);
    setError(null);

    try {
      const appsUsernames = localStorage.getItem("appsUsernames");
      const chessUsername = appsUsernames ? JSON.parse(appsUsernames)["Chess.com"] : null;

      const params = new URLSearchParams({
        spotifyTimeRange,
        chessGameType,
      });

      if (chessUsername) {
        params.set("chessUsername", chessUsername);
      }

      const response = await fetch(`/api/flashcard?${params.toString()}`, {
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

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen) {
      previewFlashcard();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
          Share
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share your TrackMe card</DialogTitle>
          <DialogDescription>
            Preview your current stats before generating the image.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[400px] items-center justify-center">
          {loading ? (
            <p>Loading your stats...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : data ? (
            <Flashcard data={data} />
          ) : null}
        </div>
        <DialogFooter className="sm:justify-start">
          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}