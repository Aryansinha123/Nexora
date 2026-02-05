import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    return new Response(
      JSON.stringify({ message: "MongoDB connected successfully" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
