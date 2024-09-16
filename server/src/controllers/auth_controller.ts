import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import { Request, Response } from "express";

// Mock user data (Replace with your database query)
const users = [
  {
    id: 1,
    email: "user@example.com",
    password: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36F9hOKcRMClKpJnDnCT9Cy", // 'password123'
  },
];
const JWT_SECRET = crypto.randomBytes(64).toString("hex");

export const loginRoute = async (req: Request, res: Response) => {
  const { email, password } = JSON.parse(req.body.toString());

  // Find user by email
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Create JWT payload
  const payload = {
    id: user.id,
    email: user.email,
  };

  // Sign token
  jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: "1h" }, // Token expires in 1 hour
    (err, token) => {
      if (err) throw err;
      res.json();
    }
  );
};

export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if user exists
  const userExists = users.find((u) => u.email === email);

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Save user to database (replace with actual DB operation)
  const newUser = {
    id: users.length + 1,
    email,
    password: hashedPassword,
  };
  users.push(newUser);

  res.status(201).json({ message: "User registered successfully" });
};
