import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { verifyToken } from "@/lib/authMiddleware";

export async function POST(req) {
  try {
    await connectDB();

    const auth = verifyToken(req);
    if (auth.error) {
      return new Response(
        JSON.stringify({ error: auth.error }),
        { status: 401 }
      );
    }

    const { productId, eventType } = await req.json();

    const event = await Event.create({
      userId: auth.user.userId,
      productId,
      eventType,
    });

    return new Response(JSON.stringify(event), { status: 201 });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}