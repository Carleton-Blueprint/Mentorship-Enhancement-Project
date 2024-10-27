"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const studentRoutes_js_1 = require("./routes/studentRoutes.js");
const mentorRoutes_js_1 = require("./routes/mentorRoutes.js");
const dateRoutes_js_1 = require("./routes/dateRoutes.js");
const courseRoutes_js_1 = require("./routes/courseRoutes.js");
const queryRoutes_js_1 = require("./routes/queryRoutes.js");
const authRoutes_js_1 = require("./routes/authRoutes.js");
const app = (0, express_1.default)();
exports.app = app;
dotenv_1.default.config();
const port = process.env.PORT || 5000;
console.log("entering server");
// Middleware for parsing request body
app.use(express_1.default.json(), 
//   cookieParser(),
(0, cors_1.default)({
    origin: [process.env.CLIENT_URL || "http://localhost:3000"],
    credentials: true,
}));
app.use("/students", studentRoutes_js_1.studentRouter);
app.use("/mentors", mentorRoutes_js_1.mentorRouter);
app.use("/date", dateRoutes_js_1.dateRouter);
app.use("/course", courseRoutes_js_1.courseRouter);
app.use("/query", queryRoutes_js_1.queryRouter);
app.use("/auth", authRoutes_js_1.authRouter);
//# sourceMappingURL=app.js.map