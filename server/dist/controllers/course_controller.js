"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCourse = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const addCourse = async (request, response) => {
    const data = request.body.data;
    // const validationErrors = validateMentors(mentors);
    // if (validationErrors.length > 0) {
    //   return response.status(400).json({ error: 'Validation error', details: validationErrors });
    // }
    try {
        const createdCourse = await callCreateCourse(data.courses);
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
    const createdCourse = await prismaClient_1.default.course.create({
        data: {
            course_code: upperCaseCourseCode,
            course_name: courses.courseName,
        },
    });
    console.log("createdCourse", createdCourse);
};
//# sourceMappingURL=course_controller.js.map