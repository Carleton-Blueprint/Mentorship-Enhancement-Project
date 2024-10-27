"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
    const count = await prisma[tableName].count();
    return count > 0;
};
const callDelete = async () => {
    if (await rowsExists('mentorCourse')) {
        const mentorCourses = await prisma.mentorCourse.findMany({
            select: {
                course_id: true,
            },
        });
        const uniqueCourseIds = new Set(mentorCourses.map(mc => mc.course_id));
        console.log(uniqueCourseIds);
        for (const course_id of uniqueCourseIds) {
            await prisma.course.delete({
                where: {
                    id: course_id,
                },
            });
        }
        await prisma.mentorCourse.deleteMany({});
    }
    if (await rowsExists('mentorAvailability')) {
        const availability = await prisma.mentorAvailability.findMany({
            select: {
                availability_id: true,
            },
        });
        const uniqueAvailability = new Set(availability.map(mc => mc.availability_id));
        for (const availability_id of uniqueAvailability) {
            await prisma.course.delete({
                where: {
                    id: availability_id,
                },
            });
        }
        await prisma.mentorAvailability.deleteMany({});
    }
    if (await rowsExists('mentor')) {
        await prisma.mentor.deleteMany({});
    }
};
//# sourceMappingURL=reset_mentor_controller.js.map