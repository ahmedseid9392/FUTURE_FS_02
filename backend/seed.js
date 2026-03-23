import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import connectDB from "./config/db.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect DB
    await connectDB();

    const email = "admin@gmail.com";
    const password = "123456";

    // Check if admin exists
    const existing = await Admin.findOne({ email });

    if (existing) {
      console.log("⚠️ Admin already exists");
      process.exit();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({
      email,
      password: hashedPassword
    });

    console.log("✅ Admin created successfully:");
    console.log({
      email: admin.email,
      password: "123456"
    });

    process.exit();

  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();