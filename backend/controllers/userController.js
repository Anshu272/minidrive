import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

/* ================= SIGNUP ================= */
export const signupController = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }],
    });

   if (existingUser) {
      // Check which field matched
      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({ message: "Email is already registered" });
      }
      if (existingUser.username === username) {
        return res.status(409).json({ message: "Username is already taken" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken({ id: user._id, role: user.role });

res.status(201).json({
  message: "Signup successful",
  token, // 👈 send token in response body
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  },
});

  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
};

/* ================= LOGIN ================= */
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken({ id: user._id, role: user.role });

 res.status(201).json({
  message: "Signup successful",
  token, // 👈 send token in response body
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  },
});

  } catch (err) {
   
    res.status(500).json({ message: "Login failed" });
  }
};





/* ================= RESET PASSWORD ================= */




export const getMe = async (req, res) => {
  try {
    // authMiddleware already verified JWT & set req.user
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};
