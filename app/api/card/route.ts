import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const slug = crypto.randomUUID();

        const [card] = await sql`
            INSERT INTO cards (
                user_id,
                slug
            )
            VALUES (
                ${user.id},
                ${slug}
            )
            RETURNING id, slug, created_at
        `;

        return NextResponse.json({
            card,
        });
    } catch (error) {
        console.error("Create card error:", error);

        return NextResponse.json(
            { error: "Failed to create card" },
            { status: 500 }
        );
    }
}