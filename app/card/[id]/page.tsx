import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Flashcard } from "@/app/dashboard/components/flashcard/flashcard";
import { getPublicFlashcardData } from "@/lib/flashcard/public";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  const data = await getPublicFlashcardData(id);

  if (!data) {
    return {
      title: "TrackMe",
    };
  }

  const baseUrl = process.env.LOCALHOST_URL;

  if (!baseUrl) {
    throw new Error("LOCALHOST_URL is not configured");
  }

  return {
    title: "My TrackMe Stats",
    description: "My latest Spotify, Chess and Steam stats.",
    openGraph: {
      title: "My TrackMe Stats",
      description: "My latest Spotify, Chess and Steam stats.",
      url: `${baseUrl}/card/${id}`,
      type: "website",
      images: [
        {
          url: `${baseUrl}/card/${id}/image`,
          width: 1200,
          height: 630,
          alt: "TrackMe stats",
        },
      ],
    },
  };
}

export default async function Page({
  params,
}: PageProps) {
  const { id } = await params;

  const data = await getPublicFlashcardData(id);
  data.spotify.timeRange = data.spotify.timeRange as "short_term" | "medium_term" | "long_term";

  if (!data) {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Flashcard data={data} />
    </main>
  );
}