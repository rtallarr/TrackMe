"use client";

import { useRef, useState } from "react";
import { toBlob } from "html-to-image";
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
  const [generatingImage, setGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const shareImage = async () => {
    if (!cardRef.current) return;

    setGeneratingImage(true);
    setError(null);

    try {
      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      if (!blob) {
        throw new Error("Failed to generate image");
      }

      const file = new File([blob], "trackme-card.png", {
        type: "image/png",
      });

      if (!navigator.share || !navigator.canShare) {
        setError("Image sharing is not supported on this browser.");
        return;
      }

      if (!navigator.canShare({ files: [file] })) {
        setError("This browser cannot share image files.");
        return;
      }

      await navigator.share({
        files: [file],
      });
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error("Failed to share image:", error);
      setError("Failed to share image.");
    } finally {
      setGeneratingImage(false);
    }
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;

    const blob = await toBlob(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
    });

    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "trackme-card.png";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Share</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share your TrackMe card</DialogTitle>
          <DialogDescription>
            Preview your current stats and share them as an image.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[400px] items-center justify-center">
          {loading ? (
            <p>Loading your stats...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : data ? (
            <div ref={cardRef}>
              <Flashcard data={data} />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button onClick={shareImage} disabled={!data || generatingImage}>
            {generatingImage ? "Generating..." : "Share as image"}
          </Button>

          <Button
            variant="outline"
            onClick={downloadImage}
            disabled={!data || generatingImage}
          >
            Download
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}