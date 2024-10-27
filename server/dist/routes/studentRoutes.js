"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.studentRouter = express_1.default.Router();
const student_controller_js_1 = require("../controllers/student_controller.js");
const reset_student_controller_js_1 = require("../controllers/reset_student_controller.js");
exports.studentRouter.post('/deleteAllStudents', reset_student_controller_js_1.deleteAll);
exports.studentRouter.post('/insertStudents', student_controller_js_1.insertManyStudents);
exports.studentRouter.post('/insertStudent', student_controller_js_1.insertStudent);
//# sourceMappingURL=studentRoutes.js.map