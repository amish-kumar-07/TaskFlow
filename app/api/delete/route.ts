import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/neon-http";
import { tasksTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const idParam = req.nextUrl.searchParams.get("id");
    const id = idParam ? parseInt(idParam) : null;

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Invalid or missing task ID" }, { status: 400 });
    }

    const deleted = await db
      .delete(tasksTable)
      .where(eq(tasksTable.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Task deleted", data: deleted[0] }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
