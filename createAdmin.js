import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User";   // 🔥 RELATIVE PATH

// 🔥 Paste your MongoDB URI directly here temporarily
const MONGO_URI = process.env.MONGODB_URI;

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);

    const existing = await User.findOne({ email: "admin@nexora.com" });

    if (existing) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = new User({
      name: "Super Admin",
      email: "admin@nexora.com",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();

    console.log("✅ Admin created successfully");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createAdmin();