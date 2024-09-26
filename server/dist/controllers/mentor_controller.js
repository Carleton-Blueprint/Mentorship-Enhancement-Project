"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMentorByID = exports.insertManyMentors = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let idNumber = 0;
const insertManyMentors = async (request, response) => {
    const mentors = request.body.data;
    const validationErrors = validateMentors(mentors);
    if (validationErrors.length > 0) {
        return response.status(400).json({ error: 'Validation error', details: validationErrors });
    }
    try {
        console.log("Calling create", mentors);
        const createdMentors = callCreate(mentors);
        response
            .status(201)
            .json({ message: "Mentors have been created", createdMentors });
    }
    catch (error) {
        console.log("entering error");
        response.status(500).json({ error: error.message });
    }
};
exports.insertManyMentors = insertManyMentors;
const updateMentorByID = async (request, response) => {
    const mentor = request.body.data;
    const mentors = [mentor];
    const validationErrors = validateMentors(mentors);
    if (validationErrors.length > 0) {
        return response.status(400).json({ error: 'Validation error', details: validationErrors });
    }
    try {
        console.log("Calling edit", mentor);
        const editedMentor = callEditByID(mentor);
        response
            .status(201)
            .json({ message: "Mentor has been edited", editedMentor });
    }
    catch (error) {
        console.log("entering error");
        response.status(500).json({ error: error.message });
    }
};
exports.updateMentorByID = updateMentorByID;
// Function to perform custom validation
function validateMentors(mentors) {
    const errors = [];
    // Example of validation logic (you can customize this based on your requirements)
    mentors.forEach((mentor, index) => {
        if (!mentor.name) {
            errors.push(`Mentor at index ${index} does not have a first name.`);
        }
        /*
        if (!mentor.mentor_id) {
          errors.push("Mentor id is necessary");
        }
        if(typeof(mentor.mentor_id) !== "number") {
          errors.push('Mentor id must be a number')
        }
    
        if (mentor.MentorAvailability) {
          errors.push('Must indicate mentor availibility')
        }*/
        // if (!mentor.program) {
        //   errors.push('Must enter current program of education')
        // }
    });
    return errors;
}
const callCreate = async (mentors) => {
    for (const mentor of mentors) {
        console.log("mentor", mentor);
        for (const course of mentor.courses) {
            console.log("course", course);
            await prisma.course.upsert({
                where: { course_code: course },
                create: {
                    course_code: course,
                    course_name: course,
                },
                update: {},
            });
        }
        idNumber += 1;
        const createdMentors = await prisma.mentor.upsert({
            where: { mentor_id: (idNumber) },
            update: {},
            create: {
                mentor_id: idNumber,
                name: mentor.name,
                email_address: mentor.email_address,
                Program: mentor.program,
                year: mentor.year,
                MentorCourse: {
                    create: mentor.courses.map((course) => ({
                        course: { connect: { course_code: course } },
                    })),
                },
            },
        });
    }
};
const callEditByID = async (mentor) => {
    console.log("mentor", mentor);
    if (!mentor.mentor_id || typeof (mentor.mentor_id) !== "number") {
        return "Mentor id is necessary";
    }
    if (mentor.courses) {
        for (const course of mentor.courses) {
            console.log("course", course);
            await prisma.course.upsert({
                where: { course_code: course },
                create: {
                    course_code: course,
                    course_name: course,
                },
                update: {},
            });
        }
    }
    const updatedMentors = await prisma.mentor.upsert({
        where: { mentor_id: (mentor.id) },
        update: {},
        create: {
            mentor_id: mentor.id,
            name: mentor.name,
            email_address: mentor.email_address,
            Program: mentor.program,
            year: mentor.year,
            MentorCourse: {
                create: mentor.courses.map((course) => ({
                    course: { connect: { course_code: course } },
                })),
            },
        },
    });
};
//# sourceMappingURL=mentor_controller.js.map