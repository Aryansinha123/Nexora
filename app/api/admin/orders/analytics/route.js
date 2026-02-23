import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/authMiddleware";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectDB();

    const auth = verifyToken(req);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), { status: 401 });
    }

    if (auth.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    // 1️⃣ Total Revenue
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // 2️⃣ Revenue Per Day
    const revenuePerDay = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          dailyRevenue: { $sum: "$totalAmount" },
          dailyOrders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // 3️⃣ Top Selling Products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: {
              $multiply: ["$items.quantity", "$items.priceAtPurchase"],
            },
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          title: "$productDetails.title",
          totalSold: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { totalSold: -1 } },
    ]);

    return new Response(
      JSON.stringify({
        overview: revenueData[0] || { totalRevenue: 0, totalOrders: 0 },
        revenuePerDay,
        topProducts,
      }),
      { status: 200 }
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}