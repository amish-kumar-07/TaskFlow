import { drizzle } from 'drizzle-orm/neon-http';
import { tasksTable } from '@/app/db/schema';

const db = drizzle(process.env.DATABASE_URL!);
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, dueDate } = body;

    if (!title || !description) {
      return new Response(JSON.stringify({ error: 'Missing title or description' }), { status: 400 });
    }

    const newTask = await db
      .insert(tasksTable)
      .values({
        title,
        description,
        completed: false,
        dueDate: dueDate ? new Date(dueDate) : null,
      })
      .returning();

    return Response.json(newTask[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
