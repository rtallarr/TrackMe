import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { sql } from "@/lib/db";
import argon2 from "argon2";

const SESSION_COOKIE = "trackme_session";
const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days

export async function hashPassword(password: string) {
  return argon2.hash(password, {
      type: argon2.argon2id,
  });
}

export async function verifyPassword(
    password: string,
    passwordHash: string
) {
    return argon2.verify(passwordHash, password);
}

function hashSessionToken(token: string) {
  return createHash("sha256")
      .update(token)
      .digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date(
      Date.now() + SESSION_DURATION * 1000
  );

  await sql`
      INSERT INTO sessions (
          user_id,
          token_hash,
          expires_at
      )
      VALUES (
          ${userId},
          ${tokenHash},
          ${expiresAt.toISOString()}
      )
  `;

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
      return null;
  }

  const tokenHash = hashSessionToken(token);

  const users = await sql`
      SELECT
          u.id,
          u.username
      FROM sessions s
      JOIN users u
          ON u.id = s.user_id
      WHERE s.token_hash = ${tokenHash}
          AND s.expires_at > NOW()
      LIMIT 1
  `;

  if (users.length === 0) {
      return null;
  }

  return users[0];
}

export async function deleteSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
        const tokenHash = hashSessionToken(token);

        await sql`
            DELETE FROM sessions
            WHERE token_hash = ${tokenHash}
        `;
    }

    cookieStore.delete(SESSION_COOKIE);
}