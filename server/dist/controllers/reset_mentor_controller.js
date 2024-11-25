"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const deleteAll = async (request, response) => {
    try {
        console.log("Deleting all mentor data");
        callDelete();
        response
            .status(201)
            .json({ message: "All mentor data has been deleted" });
    }
    catch (error) {
        console.log("entering error");
        response.status(500).json({ error: error.message });
    }
};
exports.deleteAll = deleteAll;
const rowsExists = async (tableName) => {
    const count = await prismaClient_1.default[tableName].count();
    return count > 0;
};
const callDelete = async () => {
    if (await rowsExists('mentorCourse')) {
        const mentorCourses = await prismaClient_1.default.mentorCourse.findMany({
            select: {
                course_id: true,
            },
        });
        const uniqueCourseIds = new Set(mentorCourses.map(mc => mc.course_id));
        console.log(uniqueCourseIds);
        for (const course_id of uniqueCourseIds) {
            await prismaClient_1.default.course.delete({
                where: {
                    id: course_id,
                },
            });
        }
        await prismaClient_1.default.mentorCourse.deleteMany({});
    }
    if (await rowsExists('mentorAvailability')) {
        const availability = await prismaClient_1.default.mentorAvailability.findMany({
            select: {
                availability_id: true,
            },
        });
        const uniqueAvailability = new Set(availability.map(mc => mc.availability_id));
        for (const availability_id of uniqueAvailability) {
            await prismaClient_1.default.course.delete({
                where: {
                    id: availability_id,
                },
            });
        }
        await prismaClient_1.default.mentorAvailability.deleteMany({});
    }
    if (await rowsExists('mentor')) {
        await prismaClient_1.default.mentor.deleteMany({});
    }
};
//# sourceMappingURL=reset_mentor_controller.js.map