"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDateRange = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const addDateRange = async (request, response) => {
    const data = request.body.data;
    // if (validationErrors.length > 0) {
    //   return response.status(400).json({ error: 'Validation error', details: validationErrors });
    // }
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
    const createdDateRange = await prisma.dateRange.create({
        data: {
            start_time: dateRange.startDate,
            end_time: dateRange.endDate,
        }
    });
    console.log("createdDateRange", createdDateRange);
};
//# sourceMappingURL=date_controller.js.map