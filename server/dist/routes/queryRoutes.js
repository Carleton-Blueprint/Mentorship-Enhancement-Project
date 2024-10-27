"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.queryRouter = express_1.default.Router();
const query_controller_1 = require("../controllers/query_controller");
exports.queryRouter.get('/generateCsv', query_controller_1.generateCsv);
//# sourceMappingURL=queryRoutes.js.map