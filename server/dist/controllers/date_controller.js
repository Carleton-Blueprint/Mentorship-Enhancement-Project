"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDateRange = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const addDateRange = async (request, response) => {
    const data = request.body.data;

    try {
        const createdDateRange = callCreateDateRange(data.dates);
        response
            .status(201)
            .json({ message: "date range has been created", createdDateRange });
    }
    catch (error) {
        console.log("entering error");
        response.status(500).json({ error: error.message });
    }
};
exports.addDateRange = addDateRange;
const callCreateDateRange = async (dateRange) => {
    console.log("dateRange", dateRange);
    const createdDateRange = await prismaClient_1.default.dateRange.create({
        data: {
            start_time: dateRange.startDate,
            end_time: dateRange.endDate,
        }
    });
    console.log("createdDateRange", createdDateRange);
};
//# sourceMappingURL=date_controller.js.map