import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/authMiddleware";


// GET all products
export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({ createdAt: -1 });

    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}


// POST create product (Admin only)
export async function POST(req) {
  try {
    await connectDB();

    const auth = verifyToken(req);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: 401,
      });
    }

    if (auth.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
      });
    }

    const data = await req.json();

    const product = await Product.create(data);

    return new Response(JSON.stringify(product), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}