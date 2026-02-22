import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/authMiddleware";


// GET single product
export async function GET(req, { params }) {
  try {
    await connectDB();

    const product = await Product.findById(params.id);

    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(product), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}


// PUT update product (Admin only)
export async function PUT(req, { params }) {
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

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      data,
      { new: true }
    );

    return new Response(JSON.stringify(updatedProduct), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}


// DELETE product (Admin only)
export async function DELETE(req, { params }) {
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

    await Product.findByIdAndDelete(params.id);

    return new Response(
      JSON.stringify({ message: "Product deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}