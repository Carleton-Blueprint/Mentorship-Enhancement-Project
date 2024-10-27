"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.courseRouter = express_1.default.Router();
const course_controller_js_1 = require("../controllers/course_controller.js");
exports.courseRouter.post('/addCourse', course_controller_js_1.addCourse);
//# sourceMappingURL=courseRoutes.js.map