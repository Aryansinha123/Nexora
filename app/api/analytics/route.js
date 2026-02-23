import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET() {
  try {
    await connectDB();

    // 1️⃣ Top Viewed Products
    const topViewedProducts = await Event.aggregate([
      { $match: { eventType: "view" } },

      {
        $group: {
          _id: "$productId",
          totalViews: { $sum: 1 },
        },
      },

      {
        $lookup: {
          from: "products", // collection name
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
          category: "$productDetails.category",
          price: "$productDetails.price",
          totalViews: 1,
        },
      },

      { $sort: { totalViews: -1 } },
      { $limit: 5 },
    ]);

    // 2️⃣ Total Events Per User
    const userActivity = await Event.aggregate([
      {
        $group: {
          _id: "$userId",
          totalEvents: { $sum: 1 },
        },
      },

      {
        $lookup: {
          from: "users", // collection name in MongoDB
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },

      { $unwind: "$userDetails" },

      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$userDetails.name",
          email: "$userDetails.email",
          totalEvents: 1,
        },
      },

      { $sort: { totalEvents: -1 } },
    ]);
    /*What This Does Step-by-Step
    1️⃣ $group
    Counts total events per user.

    2️⃣ $lookup
    Joins events with users collection.

    3️⃣ $unwind
    Flattens joined user array.

    4️⃣ $project
    Formats clean output.

    5️⃣ $sort
    Shows most active users first. */

    const conversionRates = await Event.aggregate([
      {
        $match: {
          eventType: { $in: ["view", "purchase"] },
        },
      },

      {
        $group: {
          _id: {
            productId: "$productId",
            eventType: "$eventType",
          },
          count: { $sum: 1 },
        },
      },

      {
        $group: {
          _id: "$_id.productId",
          views: {
            $sum: {
              $cond: [{ $eq: ["$_id.eventType", "view"] }, "$count", 0],
            },
          },
          purchases: {
            $sum: {
              $cond: [{ $eq: ["$_id.eventType", "purchase"] }, "$count", 0],
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
          views: 1,
          purchases: 1,
          conversionRate: {
            $cond: [
              { $eq: ["$views", 0] },
              0,
              { $multiply: [{ $divide: ["$purchases", "$views"] }, 100] },
            ],
          },
        },
      },

      { $sort: { conversionRate: -1 } },
    ]);

    const mostPurchased = await Event.aggregate([
      { $match: { eventType: "purchase" } },

      {
        $group: {
          _id: "$productId",
          totalPurchases: { $sum: 1 },
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
          totalPurchases: 1,
        },
      },

      { $sort: { totalPurchases: -1 } },
    ]);

    const categoryPerformance = await Event.aggregate([
      { $match: { eventType: "purchase" } },

      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },

      { $unwind: "$productDetails" },

      {
        $group: {
          _id: "$productDetails.category",
          totalPurchases: { $sum: 1 },
        },
      },

      { $sort: { totalPurchases: -1 } },
    ]);

    return new Response(
      JSON.stringify({
        topViewedProducts,
        userActivity,
        conversionRates,
        mostPurchased,
        categoryPerformance,
      }),
      { status: 200 },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

/*What This Is Doing
🔹 $match

Filters only "view" events.

🔹 $group

Groups by productId and counts.

🔹 $sort

Sorts by highest views.

🔹 $limit

Returns top 5 */
