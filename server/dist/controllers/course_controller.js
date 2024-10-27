"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCourse = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let idNumber = 0;
const addCourse = async (request, response) => {
    const data = request.body.data;
    // const validationErrors = validateMentors(mentors);
    // if (validationErrors.length > 0) {
    //   return response.status(400).json({ error: 'Validation error', details: validationErrors });
    // }
    try {
        const createdCourse = callCreateCourse(data.courses);
        response
            .status(201)
            .json({ message: "Course has been created", createdCourse });
    }
    catch (error) {
        console.log("entering error");
        response.status(500).json({ error: error.message });
    }
};
exports.addCourse = addCourse;
const callCreateCourse = async (courses) => {
    console.log("data", courses);
    const upperCaseCourseCode = courses.courseCode.toUpperCase();
    const createdCourse = await prisma.course.create({
        data: {
            course_code: upperCaseCourseCode,
            course_name: courses.courseName,
        },
    });
    console.log("createdCourse", createdCourse);
};
//# sourceMappingURL=course_controller.js.map