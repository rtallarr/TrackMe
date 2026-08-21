import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { sql } from "@/lib/db";

type RouteContext = {
    params: Promise<{
        slug: string;
    }>;
};

export async function GET(
    _req: Request,
    { params }: RouteContext
) {
    try {
        const { slug } = await params;

        const [card] = await sql`
            SELECT
                id,
                slug,
                created_at
            FROM cards
            WHERE slug = ${slug}
            LIMIT 1
        `;

        if (!card) {
            return NextResponse.json(
                { error: "Card not found" },
                { status: 404 }
            );
        }

        const snapshots = await sql`
            SELECT
                s.id,
                s.provider,
                s.blob_path,
                s.created_at
            FROM card_snapshots cs
            JOIN snapshots s
                ON s.id = cs.snapshot_id
            WHERE cs.card_id = ${card.id}
            ORDER BY s.provider;
        `;

        const data: Record<string, unknown> = {};

        for (const snapshot of snapshots) {
            const result = await get(snapshot.blob_path, {
                access: "private",
            });

            if (!result) {
                console.error(
                    `Blob not found: ${snapshot.blob_path}`
                );
                continue;
            }

            const text = await new Response(result.stream).text();

            data[snapshot.provider] = JSON.parse(text);
        }

        return NextResponse.json({
            card: {
                id: card.id,
                slug: card.slug,
                createdAt: card.created_at,
            },
            data,
        });
    } catch (error) {
        console.error("Get card error:", error);

        return NextResponse.json(
            { error: "Failed to get card" },
            { status: 500 }
        );
    }
}