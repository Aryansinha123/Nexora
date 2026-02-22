import { verifyToken } from "@/lib/authMiddleware";

export async function GET(req) {
  const result = verifyToken(req);

  if (result.error) {
    return new Response(
      JSON.stringify({ error: result.error }),
      { status: 401 }
    );
  }

  return new Response(
    JSON.stringify({
      message: "Protected route accessed",
      user: result.user,
    }),
    { status: 200 }
  );
}
