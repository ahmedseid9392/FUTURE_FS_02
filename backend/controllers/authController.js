import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";


// 🔑 LOGIN
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id },
      "secretkey", // later move to .env
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➕ CREATE ADMIN
// controllers/authController.js

export const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password: hashed
    });

    const token = jwt.sign({ id: admin._id }, "secretkey", {
      expiresIn: "1d"
    });

    res.status(201).json({ token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📄 GET ALL ADMINS
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✏️ UPDATE ADMIN
export const updateAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (email) admin.email = email;

    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }

    const updated = await admin.save();

    res.json({
      _id: updated._id,
      email: updated.email
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ❌ DELETE ADMIN
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ message: "Admin deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(404).json({ message: "User not found" });
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  admin.resetToken = resetToken;
  admin.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 min

  await admin.save();

  // Normally send email here
  res.json({
    message: "Reset token generated",
    resetToken // for testing only
  });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const admin = await Admin.findOne({
    resetToken: token,
    resetTokenExpire: { $gt: Date.now() }
  });

  if (!admin) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  admin.password = await bcrypt.hash(password, 10);
  admin.resetToken = undefined;
  admin.resetTokenExpire = undefined;

  await admin.save();

  res.json({ message: "Password reset successful" });
};