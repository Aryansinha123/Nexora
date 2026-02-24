import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/authMiddleware";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function GET(req, context) {
  try {
    await connectDB();

    const auth = verifyToken(req);
    if (auth.error || auth.user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }

    // 🔥 IMPORTANT FOR YOUR NEXT VERSION
    const params = await context.params;
    const productId = params.productId;

    console.log("Received productId:", productId);

    // Remove validation temporarily to test
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const productSales = await Order.aggregate([
      { $unwind: "$items" },
      {
        $match: {
          "items.productId": productObjectId,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          quantitySold: { $sum: "$items.quantity" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    const mlResponse = await fetch("http://localhost:8000/predict-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: productSales }),
    });

    const prediction = await mlResponse.json();

    return new Response(
      JSON.stringify({
        productSales,
        prediction,
      }),
      { status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}