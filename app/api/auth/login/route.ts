import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSession } from "@/lib/auth";
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

      const users = await sql`
          SELECT
              id,
              username,
              password_hash
          FROM users
          WHERE username = ${username}
          LIMIT 1
      `;

      if (users.length === 0) {
          return NextResponse.json(
              { error: "Invalid username or password" },
              { status: 401 }
          );
      }

      const user = users[0];

      const validPassword = await verifyPassword(
          password,
          user.password_hash
      );

      if (!validPassword) {
          return NextResponse.json(
              { error: "Invalid username or password" },
              { status: 401 }
          );
      }

      await createSession(user.id);

      return NextResponse.json({
          user: {
              id: user.id,
              username: user.username,
          },
      });

  } catch (error) {
      console.error("Login error:", error);

      return NextResponse.json(
          { error: "Failed to login" },
          { status: 500 }
      );
  }
}