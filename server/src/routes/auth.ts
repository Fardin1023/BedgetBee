import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import UserModel from "../schema/user";

const getAvatarUrl = (user: any) => {
  if (user.imageUrl) return user.imageUrl;
  
  // Try gravatar, fallback to ui-avatars if gravatar not found (404)
  const hash = crypto.createHash("md5").update(user.email.trim().toLowerCase()).digest("hex");
  const fallback = encodeURIComponent(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`);
  return `https://www.gravatar.com/avatar/${hash}?d=${fallback}`;
};

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email or username already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      username,
      email,
      passwordHash,
    });

    const savedUser = await newUser.save();
    
    const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ 
      token, 
      user: { 
        id: savedUser._id, 
        username: savedUser.username, 
        email: savedUser.email, 
        imageUrl: getAvatarUrl(savedUser),
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        currency: savedUser.currency
      } 
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Failed to register user." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        imageUrl: getAvatarUrl(user),
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency
      } 
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Failed to login." });
  }
});

export const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

router.get("/me", authMiddleware, async (req: any, res: any) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        imageUrl: getAvatarUrl(user),
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency
      } 
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    res.status(500).json({ message: "Failed to fetch user." });
  }
});

router.put("/me", authMiddleware, async (req: any, res: any) => {
  try {
    const { username, email, password, firstName, lastName, imageUrl, currency } = req.body;
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (imageUrl !== undefined) user.imageUrl = imageUrl;
    if (currency !== undefined) user.currency = currency;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();
    res.status(200).json({ 
      user: { 
        id: updatedUser._id, 
        username: updatedUser.username, 
        email: updatedUser.email, 
        imageUrl: getAvatarUrl(updatedUser),
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        currency: updatedUser.currency
      } 
    });
  } catch (error) {
    console.error("PUT ME ERROR:", error);
    res.status(500).json({ message: "Failed to update user." });
  }
});

export default router;
