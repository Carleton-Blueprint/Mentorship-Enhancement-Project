import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Request, Response } from "express";

import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

interface User {
  id?: number,
  email: string,
  password: string,
}

// Mock user data (Replace with your database query)
const users = [
  {
    id: 1,
    email: "SSSC.cmail@carleton.ca",
    password: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36F9hOKcRMClKpJnDnCT9Cy", // 'password123'
  },
];
const JWT_SECRET = process.env.JWT_SECRET

export const loginRoute = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await findUserByEmail(email);

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
      // Send token and email in the response
      res.json({ token, email: user.email });
    }
  );
};

export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if user exists
  const userExists = await findUserByEmail(email)

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  createUser(email, hashedPassword)
  res.status(201).json({ message: "User registered successfully" });
};



const findUserByEmail = async (email: string): Promise<User> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      },
    });

    if (user) {
      return user;
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error finding user:', error);
  }
}

const createUser = async (email, password) => {
  try {
    const newUser = await prisma.user.create({
      data: {
        email,      
        password
      },
    });

    console.log('User created:', newUser);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}