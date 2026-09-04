import { notFound } from "next/navigation";
import type { FlashcardData } from "@/lib/flashcard/types";
import { Flashcard } from "@/app/dashboard/components/flashcard/flashcard";

type CardResponse = {
    card: {
        id: string;
        slug: string;
        createdAt: string;
        username: string;
    };
    data: FlashcardData;
};

type PageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function CardPage({ params }: PageProps) {
    const { slug } = await params;

    const baseUrl = process.env.LOCALHOST_URL ?? "http://127.0.0.1:3000";

    const response = await fetch(
        `${baseUrl}/api/card/${encodeURIComponent(slug)}`,
        {
            cache: "no-store",
        }
    );

    if (response.status === 404) {
        notFound();
    }

    if (!response.ok) {
        throw new Error("Failed to load card");
    }

    const { card, data } = (await response.json()) as CardResponse;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#dce7df] px-4 py-10">
            <Flashcard data={data} />
            <p className="text-xs font-medium text-[#426052]">
                Shared from TrackMe · {new Date(card.createdAt).toLocaleDateString()}
            </p>
        </main>
    );
}