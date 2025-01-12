"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertStudent = exports.insertManyStudents = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const insertManyStudents = async (request, response) => {
    console.log("entering default controller");
    const students = request.body.data;
    try {
        await callCreate(students);
        response.status(201).json({ message: "Students have been created" });
    }
    catch (error) {
        console.log("entering error", error);
        response.status(500).json({ error: error.message });
    }
    finally {
        await prismaClient_1.default.$disconnect(); // Ensure connection is closed
    }
};
exports.insertManyStudents = insertManyStudents;
const callCreate = async (students) => {
    try {
        // 1. Handle Courses
        const uniqueCourses = new Set(students.flatMap(student => student.courses));
        const existingCourses = await prismaClient_1.default.course.findMany({
            where: {
                course_code: {
                    in: Array.from(uniqueCourses)
                }
            },
            select: { course_code: true }
        });
        const existingCourseCodes = new Set(existingCourses.map(c => c.course_code));
        const newCourses = Array.from(uniqueCourses).filter(code => !existingCourseCodes.has(code));
        if (newCourses.length > 0) {
            await prismaClient_1.default.course.createMany({
                data: newCourses.map(code => ({
                    course_code: code,
                    course_name: code,
                })),
                skipDuplicates: true
            });
        }
        // 2. Handle Availabilities
        const availabilityData = students.flatMap(student => student.availability.flatMap(avail => avail.time_ranges.map(time => ({
            day: avail.day,
            start_time: convertToDate(time.start_time),
            end_time: convertToDate(time.end_time),
        }))));
        const existingAvailabilities = await prismaClient_1.default.availability.findMany({
            where: {
                OR: availabilityData.map(avail => ({
                    AND: {
                        day: avail.day,
                        start_time: avail.start_time,
                        end_time: avail.end_time,
                    }
                }))
            },
            select: {
                id: true,
                day: true,
                start_time: true,
                end_time: true,
            }
        });
        const existingAvailabilityKeys = new Set(existingAvailabilities.map(a => `${a.day}-${a.start_time.toISOString()}-${a.end_time.toISOString()}`));
        const newAvailabilities = availabilityData.filter(a => !existingAvailabilityKeys.has(`${a.day}-${a.start_time.toISOString()}-${a.end_time.toISOString()}`));
        if (newAvailabilities.length > 0) {
            await prismaClient_1.default.availability.createMany({
                data: newAvailabilities,
                skipDuplicates: true
            });
        }
        // Get all availabilities after creation to have their IDs
        const allAvailabilities = await prismaClient_1.default.availability.findMany({
            where: {
                OR: availabilityData.map(avail => ({
                    AND: {
                        day: avail.day,
                        start_time: avail.start_time,
                        end_time: avail.end_time,
                    }
                }))
            }
        });
        // Create availability lookup map for quick access
        const availabilityLookup = new Map(allAvailabilities.map(a => [
            `${a.day}-${a.start_time.toISOString()}-${a.end_time.toISOString()}`,
            a.id
        ]));
        // 3. Handle Students
        const studentIds = students.map(s => s.student_id);
        const existingStudents = await prismaClient_1.default.student.findMany({
            where: {
                student_id: {
                    in: studentIds
                }
            },
            select: {
                id: true,
                student_id: true,
                first_name: true,
                last_name: true,
                email: true,
                major: true,
                preferred_name: true,
                preferred_pronouns: true,
                year_level: true
            }
        });
        const existingStudentIds = new Set(existingStudents.map(s => s.student_id));
        const studentIdToDbId = new Map(existingStudents.map(s => [s.student_id, s.id]));
        // Separate students into new and those that need updating
        const studentsToCreate = students.filter(s => !existingStudentIds.has(s.student_id));
        const studentsToUpdate = students.filter(s => {
            const existingStudent = existingStudents.find(es => es.student_id === s.student_id);
            if (!existingStudent)
                return false;
            // Check if any fields need updating
            return (existingStudent.first_name !== s.first_name ||
                existingStudent.last_name !== s.last_name ||
                existingStudent.email !== s.email ||
                existingStudent.major !== s.major ||
                existingStudent.preferred_name !== s.preferred_name ||
                existingStudent.preferred_pronouns !== s.preferred_pronouns ||
                existingStudent.year_level !== s.year_level);
        });
        // Create new students (base records only)
        if (studentsToCreate.length > 0) {
            await prismaClient_1.default.student.createMany({
                data: studentsToCreate.map(student => ({
                    student_id: student.student_id,
                    first_name: student.first_name,
                    last_name: student.last_name,
                    email: student.email,
                    major: student.major,
                    preferred_name: student.preferred_name,
                    preferred_pronouns: student.preferred_pronouns,
                    year_level: student.year_level,
                })),
                skipDuplicates: true
            });
            // Get the created students to have their IDs
            const newlyCreatedStudents = await prismaClient_1.default.student.findMany({
                where: {
                    student_id: {
                        in: studentsToCreate.map(s => s.student_id)
                    }
                },
                select: {
                    id: true,
                    student_id: true
                }
            });
            newlyCreatedStudents.forEach(s => studentIdToDbId.set(s.student_id, s.id));
        }
        // Update existing students (base records only)
        if (studentsToUpdate.length > 0) {
            await Promise.all(studentsToUpdate.map(student => prismaClient_1.default.student.update({
                where: { student_id: student.student_id },
                data: {
                    first_name: student.first_name,
                    last_name: student.last_name,
                    email: student.email,
                    major: student.major,
                    preferred_name: student.preferred_name,
                    preferred_pronouns: student.preferred_pronouns,
                    year_level: student.year_level,
                },
            })));
        }
        // 4. Handle StudentCourse relationships
        // First, delete existing relationships for students being updated
        if (studentsToUpdate.length > 0) {
            await prismaClient_1.default.studentCourse.deleteMany({
                where: {
                    student_id: {
                        in: studentsToUpdate.map(s => studentIdToDbId.get(s.student_id))
                    }
                }
            });
        }
        // Get all courses with their IDs
        const coursesWithIds = await prismaClient_1.default.course.findMany({
            where: {
                course_code: {
                    in: Array.from(uniqueCourses)
                }
            },
            select: {
                id: true,
                course_code: true
            }
        });
        // Create a lookup map for course IDs
        const courseCodeToId = new Map(coursesWithIds.map(c => [c.course_code, c.id]));
        // Create all StudentCourse relationships
        const studentCourseData = students.flatMap(student => student.courses.map(course => ({
            student_id: studentIdToDbId.get(student.student_id),
            course_id: courseCodeToId.get(course)
        }))).filter(data => data.student_id != null && data.course_id != null);
        if (studentCourseData.length > 0) {
            await prismaClient_1.default.studentCourse.createMany({
                data: studentCourseData,
                skipDuplicates: true
            });
        }
        // 5. Handle StudentAvailability relationships
        // First, delete existing relationships for students being updated
        if (studentsToUpdate.length > 0) {
            await prismaClient_1.default.studentAvailability.deleteMany({
                where: {
                    student_id: {
                        in: studentsToUpdate.map(s => studentIdToDbId.get(s.student_id))
                    }
                }
            });
        }
        // Create all StudentAvailability relationships
        const studentAvailabilityData = students.flatMap(student => student.availability.flatMap(avail => avail.time_ranges.map(time => {
            const availKey = `${avail.day}-${convertToDate(time.start_time).toISOString()}-${convertToDate(time.end_time).toISOString()}`;
            return {
                student_id: studentIdToDbId.get(student.student_id),
                availability_id: availabilityLookup.get(availKey)
            };
        })));
        if (studentAvailabilityData.length > 0) {
            await prismaClient_1.default.studentAvailability.createMany({
                data: studentAvailabilityData,
                skipDuplicates: true
            });
        }
    }
    catch (error) {
        console.error("Error in callCreate:", error);
        throw error;
    }
};
// Function to perform custom validation
function validateStudents(students) {
    const errors = [];
    // Example of validation logic (you can customize this based on your requirements)
    students.forEach((student, index) => {
        if (!student.first_name) {
            errors.push(`Student at index ${index} does not have a name.`);
        }
        if (!student.student_id) {
            errors.push("Student id is necessary");
        }
        if (typeof student.student_id !== "number") {
            errors.push("Student id must be a number");
        }
        if (!student.StudentAvailability) {
            errors.push("Must indicate student availibility");
        }
    });
    return errors;
}
function convertToDate(time) {
    const date = new Date("2024-10-01"); // Get arbitrary date
    date.setHours(time.hours, time.minutes, 0, 0); // Set the hours, minutes, seconds, and milliseconds
    return date;
}
// Inserting a student from front-end
const insertStudent = async (request, response) => {
    const studentCamelCase = request.body.data;
    const studentJSON = convertToBackEndFormat(studentCamelCase);
    const validationErrors = validateStudent(studentJSON);
    if (validationErrors.length > 0) {
        return response
            .status(400)
            .json({ error: "Validation error", details: validationErrors });
    }
    try {
        const createdStudent = createStudent(studentJSON);
        response
            .status(201)
            .json({ message: "Student has been created", createdStudent });
    }
    catch (error) {
        response.status(500).json({ error: error.message });
    }
};
exports.insertStudent = insertStudent;
const createStudent = async (student) => {
    const avail = convertAvailabilityToPrismaData(student["StudentAvailability"]);
    console.log(`studentJSON: ${JSON.stringify(student)}`);
    // adds courses to database
    for (const course of student["StudentCourse"]) {
        await prismaClient_1.default.course.upsert({
            where: { course_code: course },
            create: {
                course_code: course,
                course_name: course,
            },
            update: {},
        });
    }
    // add selected availabilities to database
    for (let time of avail) {
        // saves date object in UTC. make sure to convert to EST when retrieving data ( -5 hours)
        await prismaClient_1.default.availability.upsert({
            where: {
                unique_avail: {
                    day: time.day,
                    start_time: convertToDate(time.startTime),
                    end_time: convertToDate(time.endTime),
                },
            },
            update: {},
            create: {
                day: time.day,
                start_time: convertToDate(time.startTime),
                end_time: convertToDate(time.endTime),
            },
        });
    }
    const createdStudent = await prismaClient_1.default.student.upsert({
        where: { student_id: student["student_id"] },
        update: {},
        create: {
            student_id: student["student_id"],
            first_name: student["first_name"],
            last_name: student["last_name"],
            email: student["email"],
            major: student["major"],
            preferred_name: student["preferred_name"],
            preferred_pronouns: student["preferred_pronouns"],
            year_level: student["year_level"],
            StudentCourse: {
                create: student["StudentCourse"].map((course) => ({
                    course: { connect: { course_code: course } },
                })),
            },
            StudentAvailability: {
                create: student.availability.flatMap((avail) => avail.time_ranges.map((time) => ({
                    availability: {
                        connectOrCreate: {
                            where: {
                                unique_avail: {
                                    day: avail.day,
                                    start_time: convertToDate(time.start_time),
                                    end_time: convertToDate(time.end_time),
                                },
                            },
                            create: {
                                day: avail.day,
                                start_time: convertToDate(time.start_time),
                                end_time: convertToDate(time.end_time),
                            },
                        },
                    },
                }))),
            },
        },
    });
};
function convertAvailabilityToPrismaData(availabilityArray) {
    // look up tables for dates
    const itoDay = {
        0: "Monday",
        1: "Tuesday",
        2: "Wednesday",
        3: "Thursday",
        4: "Friday",
    };
    const itoSlot = {
        0: { hours: 10, minutes: 0 },
        1: { hours: 10, minutes: 30 },
        2: { hours: 11, minutes: 0 },
        3: { hours: 11, minutes: 30 },
        4: { hours: 12, minutes: 0 },
        5: { hours: 12, minutes: 30 },
        6: { hours: 13, minutes: 0 }, // Date() automatically converts to 12 hour format
        7: { hours: 13, minutes: 30 },
        8: { hours: 14, minutes: 0 },
        9: { hours: 14, minutes: 30 },
        10: { hours: 15, minutes: 0 },
        11: { hours: 15, minutes: 30 },
    };
    let avail = [];
    // iterates through 2d array to produce timeslots
    for (let day = 0; day < availabilityArray.length; day++) {
        for (let timeslot = 0; timeslot < availabilityArray[day].length; timeslot++) {
            if (availabilityArray[day][timeslot]) {
                const startTime = new Date("2024-10-01");
                startTime.setHours(itoSlot[timeslot]["hours"], itoSlot[timeslot]["minutes"], 0, 0);
                const endTime = new Date("2024-10-01");
                endTime.setHours(itoSlot[timeslot]["hours"], itoSlot[timeslot]["minutes"] + 30, 0, 0);
                avail.push({
                    day: itoDay[day],
                    startTime: {
                        hours: startTime.getHours(),
                        minutes: startTime.getMinutes(),
                    },
                    endTime: { hours: endTime.getHours(), minutes: endTime.getMinutes() },
                });
            }
        }
    }
    return avail;
}
// Interface to convert front end naming scheme to backend naming scheme
function convertToBackEndFormat(student) {
    return {
        student_id: Number(student["entityNumber"]),
        first_name: student["firstName"],
        last_name: student["lastName"],
        major: student["major"],
        preferred_name: student["preferredName"],
        preferred_pronouns: student["preferredPronouns"],
        email: student["email"],
        year_level: student["yearLevel"],
        StudentAvailability: student["availability"],
        StudentCourse: student["courses"],
    };
}
function validateStudent(student) {
    const errors = [];
    if (!student.first_name) {
        errors.push(`Student does not have a name.`);
    }
    if (!student.student_id) {
        errors.push("Student id is necessary");
    }
    if (typeof student.student_id !== "number") {
        errors.push("Student id must be a number");
    }
    // if (!student.major) {
    //     errors.push("Must indicate student's major")
    // }
    if (!student.email) {
        errors.push("Student email is necessary");
    }
    // if (!student.year_level) {
    //     errors.push("Must indicate student's year level")
    // }
    if (!student.StudentCourse) {
        errors.push("Must indicate courses needing improvement");
    }
    if (!student.StudentAvailability) {
        errors.push("Must indicate student availibility");
    }
    return errors;
}
//# sourceMappingURL=student_controller.js.map