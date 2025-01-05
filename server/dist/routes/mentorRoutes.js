"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mentorRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.mentorRouter = express_1.default.Router();
const mentor_controller_js_1 = require("../controllers/mentor_controller.js");
const reset_mentor_controller_js_1 = require("../controllers/reset_mentor_controller.js");
exports.mentorRouter.post('/deleteAllMentors', reset_mentor_controller_js_1.deleteAll);
exports.mentorRouter.post('/insertMentors', mentor_controller_js_1.insertManyMentors);
exports.mentorRouter.post('/updateMentorByID', mentor_controller_js_1.updateMentorByID);
exports.mentorRouter.post('/addMentorAvailability', mentor_controller_js_1.addMentorAvailability);
//# sourceMappingURL=mentorRoutes.js.map