import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/neon-http";
import { tasksTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { integer, timestamp } from "drizzle-orm/pg-core";

const db = drizzle(process.env.DATABASE_URL!);

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const idParam = req.nextUrl.searchParams.get("id");
    const id = idParam ? parseInt(idParam) : null;

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Invalid or missing task ID" }, { status: 400 });
    }

    const body = await req.json();
    const { title, description, completed, dueDate } = body;

    const updateData: Partial<{
      title: string;
      description: string;
      completed: boolean;
      dueDate: Date | null;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (completed !== undefined) updateData.completed = completed;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updated = await db
      .update(tasksTable)
      .set(updateData)
      .where(eq(tasksTable.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated[0] }, { status: 200 });
  } catch (err: any) {
    console.error("Error updating task:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
