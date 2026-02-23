import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import mongoose from "mongoose";

export async function GET(req, context) {
  try {
    await connectDB();

    const { productId } = await context.params;

    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Step 1: Get users who viewed this product
    const users = await Event.find({
      productId: productObjectId,
      eventType: "view",
    }).distinct("userId");

    // Step 2: Find other products viewed by those users
    const recommendations = await Event.aggregate([
      {
        $match: {
          userId: { $in: users },
          productId: { $ne: productObjectId },
          eventType: { $in: ["view", "cart", "purchase"] },
        },
      },

      {
        $addFields: {
          weight: {
            $switch: {
              branches: [
                { case: { $eq: ["$eventType", "view"] }, then: 1 },
                { case: { $eq: ["$eventType", "cart"] }, then: 3 },
                { case: { $eq: ["$eventType", "purchase"] }, then: 5 },
              ],
              default: 1,
            },
          },
        },
      },

      {
        $group: {
          _id: "$productId",
          score: { $sum: "$weight" },
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
          price: "$productDetails.price",
          score: 1,
        },
      },

      { $sort: { score: -1 } },
      { $limit: 5 },
    ]);

    return new Response(JSON.stringify(recommendations), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
