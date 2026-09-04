import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCardData } from "@/lib/card-data";

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
                c.id,
                c.slug,
                c.created_at,
                u.username
            FROM cards c
            JOIN users u
                ON u.id = c.user_id
            WHERE c.slug = ${slug}
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

        return NextResponse.json({
            card: {
                id: card.id,
                slug: card.slug,
                createdAt: card.created_at,
                username: card.username,
            },
            data: await getCardData(snapshots, card.username),
        });
    } catch (error) {
        console.error("Get card error:", error);

        return NextResponse.json(
            { error: "Failed to get card" },
            { status: 500 }
        );
    }
}