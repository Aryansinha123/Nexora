import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/authMiddleware";
import Product from "@/models/Product";
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

    const params = await context.params;
    const productId = params.productId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return new Response(
        JSON.stringify({ error: "Invalid product ID" }),
        { status: 400 }
      );
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Get product
    const product = await Product.findById(productObjectId);
    if (!product) {
      return new Response(
        JSON.stringify({ error: "Product not found" }),
        { status: 404 }
      );
    }

    // Aggregate daily quantity sold
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

    // Call ML service
    const mlResponse = await fetch("http://localhost:8000/predict-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: productSales }),
    });

    const predictionData = await mlResponse.json();

    const predictedArray = predictionData.next_7_days_demand || [];

    if (predictedArray.length === 0) {
      return new Response(
        JSON.stringify({
          message: "Not enough data for prediction",
        }),
        { status: 200 }
      );
    }

    const totalPredictedDemand = predictedArray.reduce((a, b) => a + b, 0);
    const dailyAverageDemand = totalPredictedDemand / 7;

    const currentStock = product.stock;

    const daysUntilStockout =
      dailyAverageDemand > 0
        ? currentStock / dailyAverageDemand
        : Infinity;

    const risk = daysUntilStockout < 7;

    const safetyBuffer = 10;

    const recommendedRestock = Math.max(
      0,
      Math.ceil(totalPredictedDemand - currentStock + safetyBuffer)
    );

    return new Response(
      JSON.stringify({
        currentStock,
        predicted7DayDemand: totalPredictedDemand,
        dailyAverageDemand,
        daysUntilStockout,
        risk,
        recommendedRestock,
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