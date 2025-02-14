"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMentorAvailability = exports.updateMentorByID = exports.insertManyMentors = void 0;
const client_1 = require("@prisma/client");
const prismaClient_1 = __importDefault(require("../prismaClient"));
let idNumber = 0;
function cleanTimeSlot(timeSlot) {
    // Remove _N suffix from timeslots (e.g., "10:00am to 10:30am_1" -> "10:00am to 10:30am")
    return timeSlot.replace(/_\d+$/, "");
}
function convertTimeStringToDate(timeStr) {
    // Parse time (assuming 12-hour format)
    const [hourMin, period] = timeStr.split(/(?=[ap]m)/i);
    const [hours, minutes] = hourMin.split(":");
    // Convert to 24-hour format
    let hour = parseInt(hours);
    if (period.toLowerCase() === "pm" && hour !== 12) {
        hour += 12;
    }
    if (period.toLowerCase() === "am" && hour === 12) {
        hour = 0;
    }
    // Set the date to a fixed value (e.g., 2024-10-01) for consistent parsing
    const date = new Date("2024-10-01");
    date.setHours(hour, parseInt(minutes), 0, 0);
    console.log("date", date);
    return date;
}
const insertManyMentors = async (request, response) => {
    const mentors = request.body.data;
    // console.log("request body", request.body);
    const validationErrors = validateMentors(mentors);
    if (validationErrors.length > 0) {
        return response
            .status(400)
            .json({ error: "Validation error", details: validationErrors });
    }
    try {
        // console.log("Calling create mentors", mentors);
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
        return response
            .status(400)
            .json({ error: "Validation error", details: validationErrors });
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
const addMentorAvailability = async (request, response) => {
    const mentors = request.body.data;
    // console.log("request body", request.body);
    console.log("request.body.data", request.body.data);
    try {
        const updatedMentors = await addAvailability(mentors);
        response
            .status(201)
            .json({ message: "Mentor availability has been added", updatedMentors });
    }
    catch (error) {
        console.log("entering error");
        response.status(500).json({ error: error.message });
    }
};
exports.addMentorAvailability = addMentorAvailability;
// Function to perform custom validation
function validateMentors(mentors) {
    const errors = [];
    // Example of validation logic (you can customize this based on your requirements)
    mentors.forEach((mentor, index) => {
        if (!mentor.name) {
            errors.push(`Mentor at index ${index} does not have a first name.`);
        }
    });
    return errors;
}
let prismaInstance = null;
const getPrismaInstance = () => {
    if (!prismaInstance) {
        prismaInstance = new client_1.PrismaClient({
            log: ["query", "info", "warn", "error"],
        });
    }
    return prismaInstance;
};
const cleanupPrisma = async () => {
    if (prismaInstance) {
        await prismaInstance.$disconnect();
        prismaInstance = null;
    }
};
const addAvailability = async (mentor_data) => {
    const MAX_RETRIES = 3;
    const BATCH_SIZE = 50;
    const prisma = getPrismaInstance();
    const retryOperation = async (operation, retries = MAX_RETRIES) => {
        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            }
            catch (error) {
                if (i === retries - 1 || !error.message?.includes("connection"))
                    throw error;
                await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
    };
    try {
        // 1. Process mentors in batches
        const mentorIds = mentor_data.map((data) => parseInt(data["Student ID"]));
        const existingMentors = await retryOperation(() => prisma.mentor.findMany({
            where: {
                mentor_id: { in: mentorIds },
            },
            select: {
                id: true,
                mentor_id: true,
            },
        }));
        const existingMentorIds = new Set(existingMentors.map((m) => m.mentor_id));
        // Split mentors into batches
        const mentorsToCreate = mentor_data.filter((data) => !existingMentorIds.has(parseInt(data["Student ID"])));
        // Create mentors in batches
        for (let i = 0; i < mentorsToCreate.length; i += BATCH_SIZE) {
            const batch = mentorsToCreate.slice(i, i + BATCH_SIZE);
            await retryOperation(() => prisma.mentor.createMany({
                data: batch.map((data) => ({
                    mentor_id: parseInt(data["Student ID"]),
                    name: data["Full Name"],
                    email_address: data["Email Address"],
                    Program: data.Program,
                    year: data.Year,
                })),
                skipDuplicates: true,
            }));
        }
        // Add course handling after mentor creation
        const allCourses = new Set(mentor_data.flatMap((data) => data.courses || []));
        // Create courses if they don't exist
        if (allCourses.size > 0) {
            await retryOperation(() => prisma.course.createMany({
                data: Array.from(allCourses).map((code) => ({
                    course_code: code,
                    course_name: code,
                })),
                skipDuplicates: true,
            }));
        }
        // Get course IDs
        const courses = await retryOperation(() => prisma.course.findMany({
            where: {
                course_code: { in: Array.from(allCourses) },
            },
            select: {
                id: true,
                course_code: true,
            },
        }));
        const courseCodeToId = new Map(courses.map((c) => [c.course_code, c.id]));
        // Create mentor-course connections
        const mentorCourseData = mentor_data
            .flatMap((data) => (data.courses || []).map((course) => ({
            mentor_id: mentorIdToDbId.get(parseInt(data["Student ID"])),
            course_id: courseCodeToId.get(course),
        })))
            .filter((data) => data.mentor_id != null && data.course_id != null);
        // Create course connections in batches
        for (let i = 0; i < mentorCourseData.length; i += BATCH_SIZE) {
            const batch = mentorCourseData.slice(i, i + BATCH_SIZE);
            await retryOperation(() => prisma.mentorCourse.createMany({
                data: batch,
                skipDuplicates: true,
            }));
            // Add small delay between batches
            if (i + BATCH_SIZE < mentorCourseData.length) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
        // 2. Process availabilities in batches
        const availabilityData = mentor_data.flatMap((data) => Object.entries(data.availability).flatMap(([day, timeSlots]) => timeSlots.map((slot) => {
            const timeRange = cleanTimeSlot(slot);
            const [startTime, endTime] = timeRange.split(" to ");
            return {
                day,
                start_time: convertTimeStringToDate(startTime),
                end_time: convertTimeStringToDate(endTime),
            };
        })));
        // Create availabilities in batches
        for (let i = 0; i < availabilityData.length; i += BATCH_SIZE) {
            const batch = availabilityData.slice(i, i + BATCH_SIZE);
            await retryOperation(() => prisma.availability.createMany({
                data: batch,
                skipDuplicates: true,
            }));
        }
        // Get all mentor and availability IDs
        const [allMentors, allAvailabilities] = await Promise.all([
            retryOperation(() => prisma.mentor.findMany({
                where: { mentor_id: { in: mentorIds } },
                select: { id: true, mentor_id: true },
            })),
            retryOperation(() => prisma.availability.findMany({
                where: {
                    OR: availabilityData.map((avail) => ({
                        AND: {
                            day: avail.day,
                            start_time: avail.start_time,
                            end_time: avail.end_time,
                        },
                    })),
                },
            })),
        ]);
        // Create lookup maps
        const mentorIdToDbId = new Map(allMentors.map((m) => [m.mentor_id, m.id]));
        const availabilityLookup = new Map(allAvailabilities.map((a) => [
            `${a.day}-${a.start_time.toISOString()}-${a.end_time.toISOString()}`,
            a.id,
        ]));
        // 3. Create mentor-availability connections in batches
        const mentorAvailabilityData = mentor_data
            .flatMap((data) => Object.entries(data.availability).flatMap(([day, timeSlots]) => timeSlots.map((slot) => {
            const timeRange = cleanTimeSlot(slot);
            const [startTime, endTime] = timeRange.split(" to ");
            const availKey = `${day}-${convertTimeStringToDate(startTime).toISOString()}-${convertTimeStringToDate(endTime).toISOString()}`;
            const mentorId = mentorIdToDbId.get(parseInt(data["Student ID"]));
            const availabilityId = availabilityLookup.get(availKey);
            return {
                mentor_id: mentorId,
                availability_id: availabilityId,
            };
        })))
            .filter((data) => data.mentor_id != null && data.availability_id != null);
        // Create connections in batches
        for (let i = 0; i < mentorAvailabilityData.length; i += BATCH_SIZE) {
            const batch = mentorAvailabilityData.slice(i, i + BATCH_SIZE);
            await retryOperation(() => prisma.mentorAvailability.createMany({
                data: batch,
                skipDuplicates: true,
            }));
            // Add small delay between batches
            if (i + BATCH_SIZE < mentorAvailabilityData.length) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
    }
    catch (error) {
        console.error("Error in addAvailability:", error);
        throw error;
    }
    finally {
        await cleanupPrisma();
    }
};
const callCreate = async (mentors) => {
    try {
        // 1. Handle Courses
        const uniqueCourses = new Set(mentors.flatMap((mentor) => mentor.courses));
        const existingCourses = await prismaClient_1.default.course.findMany({
            where: {
                course_code: {
                    in: Array.from(uniqueCourses),
                },
            },
            select: {
                id: true,
                course_code: true,
            },
        });
        const existingCourseCodes = new Set(existingCourses.map((c) => c.course_code));
        const newCourses = Array.from(uniqueCourses).filter((code) => !existingCourseCodes.has(code));
        if (newCourses.length > 0) {
            await prismaClient_1.default.course.createMany({
                data: newCourses.map((code) => ({
                    course_code: code,
                    course_name: code,
                })),
                skipDuplicates: true,
            });
        }
        // 2. Process each mentor
        const createdMentors = await Promise.all(mentors.map(async (mentor) => {
            const createdMentor = await prismaClient_1.default.mentor.upsert({
                where: { mentor_id: mentor.mentor_id },
                create: {
                    mentor_id: mentor.mentor_id,
                    name: mentor.name,
                    email_address: mentor.email_address,
                    Program: mentor.program,
                    year: mentor.year,
                },
                update: {
                    name: mentor.name,
                    email_address: mentor.email_address,
                    Program: mentor.program,
                    year: mentor.year,
                },
            });
            // Handle Mentor-Course relationships
            if (mentor.courses?.length) {
                // Delete existing connections
                await prismaClient_1.default.mentorCourse.deleteMany({
                    where: { mentor_id: createdMentor.id },
                });
                // Create new connections
                const connections = mentor.courses
                    .map((course) => {
                    const courseId = existingCourses.find((c) => c.course_code === course)?.id;
                    return courseId
                        ? {
                            mentor_id: createdMentor.id,
                            course_id: courseId,
                        }
                        : null;
                })
                    .filter((conn) => conn !== null);
                if (connections.length > 0) {
                    await prismaClient_1.default.mentorCourse.createMany({
                        data: connections,
                        skipDuplicates: true,
                    });
                }
            }
            return createdMentor; // Return the created mentor
        }));
        // Log all created mentors
        console.log("Created Mentors:", createdMentors);
        console.log("Mentor creation completed successfully");
    }
    catch (error) {
        console.error("Error in callCreate:", error);
        throw error;
    }
};
const callEditByID = async (mentor) => {
    // console.log("mentor", mentor);
    if (!mentor.mentor_id || typeof mentor.mentor_id !== "number") {
        return "Mentor id is necessary";
    }
    if (mentor.courses) {
        for (const course of mentor.courses) {
            // console.log("course", course);
            await prismaClient_1.default.course.upsert({
                where: { course_code: course },
                create: {
                    course_code: course,
                    course_name: course,
                },
                update: {},
            });
        }
    }

    const updatedMentors = await prismaClient_1.default.mentor.upsert({
        where: { mentor_id: mentor.id },
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