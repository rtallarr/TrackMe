import { get, put } from "@vercel/blob";
import { sql } from "@/lib/db";

export async function createSnapshot(
  userId: string,
  data: unknown
) {
  const snapshotId = crypto.randomUUID();
  const blobPath = `snapshots/${userId}/${snapshotId}.json`;

  const blob = await put(
    blobPath,
    JSON.stringify(data),
    {
      access: "private",
      contentType: "application/json",
    }
  );

  await sql`
    INSERT INTO snapshots (
      id,
      user_id,
      blob_path
    )
    VALUES (
      ${snapshotId},
      ${userId},
      ${blob.pathname}
    )
  `;

  return snapshotId;
}

export async function getSnapshot(snapshotId: string) {
  const snapshots = await sql`
    SELECT id, user_id, blob_path, created_at
    FROM snapshots
    WHERE id = ${snapshotId}
    LIMIT 1
  `;

  if (snapshots.length === 0) {
    return null;
  }

  const snapshot = snapshots[0];

  const blob = await get(snapshot.blob_path, {
    access: "private",
  });

  if (!blob) {
    return null;
  }

  const text = await new Response(blob.stream).text();

  return {
    id: snapshot.id,
    userId: snapshot.user_id,
    createdAt: snapshot.created_at,
    data: JSON.parse(text),
  };
}