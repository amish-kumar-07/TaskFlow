import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/neon-http";
import { tasksTable } from "@/app/db/schema";

const db = drizzle(process.env.DATABASE_URL!);

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await db.select().from(tasksTable);

    if (response.length === 0) {
      return NextResponse.json({ message: "No records found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: response }, { status: 200 });
  } catch (err: any) {
    console.error("Error while fetching tasks:", err);
    return NextResponse.json(
      { message: "Server error", error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
