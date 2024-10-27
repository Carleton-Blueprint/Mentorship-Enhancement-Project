"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = exports.loginRoute = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
// Mock user data (Replace with your database query)
const users = [
    {
        id: 1,
        email: "SSSC.cmail@carleton.ca",
        password: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36F9hOKcRMClKpJnDnCT9Cy", // 'password123'
    },
];
const JWT_SECRET = process.env.JWT_SECRET;
const loginRoute = async (req, res) => {
    const { email, password } = req.body;
    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    // Compare passwords
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    // Create JWT payload
    const payload = {
        id: user.id,
        email: user.email,
    };
    // Sign token
    jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "1h" }, // Token expires in 1 hour
    (err, token) => {
        if (err)
            throw err;
        // Send token and email in the response
        res.json({ token, email: user.email });
    });
};
exports.loginRoute = loginRoute;
const registerUser = async (req, res) => {
    const { email, password } = req.body;
    // Check if user exists
    const userExists = await findUserByEmail(email);
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }
    // Hash password
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
    createUser(email, hashedPassword);
    res.status(201).json({ message: "User registered successfully" });
};
exports.registerUser = registerUser;
const findUserByEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            },
        });
        if (user) {
            return user;
        }
        else {
            console.log('User not found');
        }
    }
    catch (error) {
        console.error('Error finding user:', error);
    }
};
const createUser = async (email, password) => {
    try {
        const newUser = await prisma.user.create({
            data: {
                email,
                password
            },
        });
        console.log('User created:', newUser);
    }
    catch (error) {
        console.error('Error creating user:', error);
    }
    finally {
        await prisma.$disconnect();
    }
};
//# sourceMappingURL=auth_controller.js.map