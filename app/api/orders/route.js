import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/authMiddleware";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Event from "@/models/Event";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectDB();

    const auth = verifyToken(req);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(auth.user.userId);
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), { status: 400 });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });
      }

      if (product.stock < item.quantity) {
        return new Response(JSON.stringify({ error: "Insufficient stock" }), { status: 400 });
      }

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();

      totalAmount += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });

      // Log purchase event
      await Event.create({
        userId,
        productId: product._id,
        eventType: "purchase",
      });
    }

    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
    });

    return new Response(JSON.stringify(order), { status: 201 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
export async function GET(req) {
  try {
    await connectDB();

    const auth = verifyToken(req);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), { status: 401 });
    }

    const userId = auth.user.userId;

    const orders = await Order.find({ userId })
      .populate("items.productId", "title price");

    return new Response(JSON.stringify(orders), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

/**1️⃣ Verify user
2️⃣ Validate stock
3️⃣ Reduce stock
4️⃣ Calculate total
5️⃣ Create order
6️⃣ Log purchase event */