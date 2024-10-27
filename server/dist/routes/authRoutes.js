"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.authRouter = express_1.default.Router();
const auth_controller_js_1 = require("../controllers/auth_controller.js");
exports.authRouter.post('/login', auth_controller_js_1.loginRoute);
exports.authRouter.post('/register', auth_controller_js_1.registerUser);
//# sourceMappingURL=authRoutes.js.map