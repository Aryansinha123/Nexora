/*For a given user:

1️⃣ Get all products they interacted with
2️⃣ Find other users who interacted with same products
3️⃣ Find products those users interacted with
4️⃣ Exclude products current user already saw
5️⃣ Weight by event type (view/cart/purchase)
6️⃣ Rank and return top results*/
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { verifyToken } from "@/lib/authMiddleware";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();

    // Authenticate user
    const auth = verifyToken(req);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: 401,
      });
    }

    const userId = new mongoose.Types.ObjectId(auth.user.userId);

    // Step 1: Get products current user interacted with
    const userProducts = await Event.find({ userId }).distinct("productId");

    if (userProducts.length === 0) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Step 2: Find similar users
    const similarUsers = await Event.find({
      productId: { $in: userProducts },
      userId: { $ne: userId },
    }).distinct("userId");

    if (similarUsers.length === 0) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Step 3: Find products similar users interacted with
    const recommendations = await Event.aggregate([
      {
        $match: {
          userId: { $in: similarUsers },
          productId: { $nin: userProducts },
          eventType: { $in: ["view", "cart", "purchase"] },
        },
      },
      {
        $addFields: {
          baseWeight: {
            $switch: {
              branches: [
                { case: { $eq: ["$eventType", "view"] }, then: 1 },
                { case: { $eq: ["$eventType", "cart"] }, then: 3 },
                { case: { $eq: ["$eventType", "purchase"] }, then: 5 },
              ],
              default: 1,
            },
          },
          hoursSinceEvent: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60,
            ],
          },
        },
      },
      {
        $addFields: {
          timeDecayFactor: {
            $divide: [1, { $add: [1, "$hoursSinceEvent"] }],
          },
        },
      },
      {
        $addFields: {
          weight: {
            $multiply: ["$baseWeight", "$timeDecayFactor"],
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

    const trending = await Event.aggregate([
      {
        $match: {
          eventType: { $in: ["view", "cart", "purchase"] },
        },
      },
      {
        $addFields: {
          baseWeight: {
            $switch: {
              branches: [
                { case: { $eq: ["$eventType", "view"] }, then: 1 },
                { case: { $eq: ["$eventType", "cart"] }, then: 3 },
                { case: { $eq: ["$eventType", "purchase"] }, then: 5 },
              ],
              default: 1,
            },
          },
          hoursSinceEvent: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60,
            ],
          },
        },
      },
      {
        $addFields: {
          timeDecayFactor: {
            $divide: [1, { $add: [1, "$hoursSinceEvent"] }],
          },
        },
      },
      {
        $addFields: {
          weight: {
            $multiply: ["$baseWeight", "$timeDecayFactor"],
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

    if (recommendations.length > 0) {
      return new Response(
        JSON.stringify({
          type: "personalized",
          data: recommendations,
        }),
        { status: 200 },
      );
    }

    return new Response(
      JSON.stringify({
        type: "trending",
        data: trending,
      }),
      { status: 200 },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// user-based collaborative filtering.
