import { NextRequest, NextResponse } from "next/server";
import { hashPassword, createSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const username = body.username?.trim();
    const password = body.password;

    if (!username || !password) {
        return NextResponse.json(
            { error: "Username and password are required" },
            { status: 400 }
        );
    }

    if (username.length < 3 || username.length > 50) {
        return NextResponse.json(
            { error: "Username must be between 3 and 50 characters" },
            { status: 400 }
        );
    }

    if (password.length < 8) {
        return NextResponse.json(
            { error: "Password must be at least 8 characters" },
            { status: 400 }
        );
    }

    const existingUsers = await sql`
        SELECT id
        FROM users
        WHERE username = ${username}
        LIMIT 1
    `;

    if (existingUsers.length > 0) {
        return NextResponse.json(
            { error: "Username already exists" },
            { status: 409 }
        );
    }

    const passwordHash = await hashPassword(password);

    const users = await sql`
        INSERT INTO users (
            username,
            password_hash
        )
        VALUES (
            ${username},
            ${passwordHash}
        )
        RETURNING id, username
    `;

    const user = users[0];

    await createSession(user.id);

    return NextResponse.json({
        user,
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}