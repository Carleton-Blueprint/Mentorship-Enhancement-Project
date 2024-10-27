"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.dateRouter = express_1.default.Router();
const date_controller_js_1 = require("../controllers/date_controller.js");
exports.dateRouter.post('/addDateRange', date_controller_js_1.addDateRange);
//# sourceMappingURL=dateRoutes.js.map