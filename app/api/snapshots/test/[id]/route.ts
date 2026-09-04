import { getSnapshot } from "@/lib/snapshots";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const snapshot = await getSnapshot(id);

  if (!snapshot) {
    return NextResponse.json(
      { error: "Snapshot not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(snapshot);
}