"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCsv = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const generateCsv = async (request, response) => {
    // Match all students with mentors
    const { matches, unmatchedStudents } = await findMatches();
    console.log("matches.slice(0,5)", matches.slice(0, 5));
    console.log("unmatchedStudents.slice(0,5)", unmatchedStudents.slice(0, 5));
    console.log("matches.length", matches.length);
    console.log("unmatchedStudents.length", unmatchedStudents.length);
    let csvContent = "";
    let unmatchedCsvContent = "";
    if (matches.length > 0) {
        csvContent = convertToCsv(matches);
    }
    else {
        console.log("No students were matched with mentors.");
    }
    if (unmatchedStudents.length > 0) {
        unmatchedCsvContent = convertUnmatchedToCsv(unmatchedStudents);
    }
    else {
        console.log("All students were matched with mentors.");
    }
    const content = { csvContent, unmatchedCsvContent };
    // console.log("content", content);
    try {
        return response.status(200).json(content);
    }
    catch (error) {
        console.log("error returning csv output");
        return response.status(500).json({ message: "Internal server error" });
    }
};
exports.generateCsv = generateCsv;
const findMatches = async () => {
    try {
        // Reset all mentor pairings at start
        await prismaClient_1.default.mentor.updateMany({
            data: { Pairings: 0 },
        });
        const students = await prismaClient_1.default.student.findMany({
            include: {
                StudentCourse: { include: { course: true } },
                StudentAvailability: { include: { availability: true } },
            },
        });
        let matches = [];
        let unmatchedStudents = [];
        let mentorPairings = new Map(); // Track pairings per mentor
        // Add logging to track unmatched students
        console.log("Total students before matching:", students.length);
        for (const student of students) {
            const studentCourseIds = student.StudentCourse.map((sc) => sc.course_id);
            // Find all mentors with at least one matching course
            const mentors = await prismaClient_1.default.mentor.findMany({
                where: {
                    MentorCourse: {
                        some: {
                            course_id: {
                                in: studentCourseIds,
                            },
                        },
                    },
                },
                include: {
                    MentorCourse: { include: { course: true } },
                    MentorAvailability: { include: { availability: true } },
                },
            });
            if (mentors.length === 0) {
                console.log(`No mentors with matching courses found for student ${student.email}`);
                unmatchedStudents.push({
                    studentId: student.student_id,
                    studentEmail: student.email,
                    studentFirstName: student.first_name,
                    studentLastName: student.last_name,
                });
                continue;
            }
            // For each mentor with matching courses, create a potential match
            for (const mentor of mentors) {
                const studentAvailabilities = student.StudentAvailability.map((sa) => ({
                    availability_id: sa.availability_id,
                    day: sa.availability.day,
                    start_time: sa.availability.start_time,
                    end_time: sa.availability.end_time,
                }));
                const mentorAvailabilities = mentor.MentorAvailability.map((ma) => ({
                    day: ma.availability.day,
                    start_time: ma.availability.start_time,
                    end_time: ma.availability.end_time,
                }));
                // Find overlapping timeslots
                const overlappingTimeslots = studentAvailabilities.filter((sTime) => mentorAvailabilities.some((mTime) => mTime.day === sTime.day &&
                    mTime.start_time.getTime() === sTime.start_time.getTime() &&
                    mTime.end_time.getTime() === sTime.end_time.getTime()));
                // Calculate matched and unmatched courses
                const matchedCourses = student.StudentCourse.filter((sc) => mentor.MentorCourse.some((mc) => mc.course_id === sc.course_id)).map((sc) => sc.course.course_name);
                const unmatchedCourses = student.StudentCourse.filter((sc) => !mentor.MentorCourse.some((mc) => mc.course_id === sc.course_id)).map((sc) => sc.course.course_name);
                const hasTimeOverlap = overlappingTimeslots.length > 0;
                matches.push({
                    studentId: student.student_id,
                    studentEmail: student.email,
                    studentFirstName: student.first_name,
                    studentLastName: student.last_name,
                    mentorId: mentor.mentor_id,
                    mentorFirstName: mentor.name.split(" ")[0],
                    mentorLastName: mentor.name.split(" ")[1],
                    mentorEmail: mentor.email_address,
                    matchedCourses,
                    unmatchedCourses,
                    isPerfectMatch: hasTimeOverlap && unmatchedCourses.length === 0,
                    isFlaggedMatch: !hasTimeOverlap && matchedCourses.length > 0,
                    matchedTimeslots: overlappingTimeslots.map((slot) => ({
                        day: slot.day,
                        startTime: slot.start_time,
                        endTime: slot.end_time,
                    })),
                });
                // Track this potential pairing
                mentorPairings.set(mentor.mentor_id, (mentorPairings.get(mentor.mentor_id) || 0) + 1);
            }
        }
        // Update all mentor pairings in a single transaction
        await prismaClient_1.default.$transaction(Array.from(mentorPairings.entries()).map(([mentorId, count]) => prismaClient_1.default.mentor.update({
            where: { mentor_id: mentorId },
            data: { Pairings: count },
        })));
        // Log final counts
        console.log("Final matches:", matches.length);
        console.log("Final unmatched students:", unmatchedStudents.length);
        return { matches, unmatchedStudents };
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to match students with mentors");
    }
};
// Function to convert matches to CSV format for frontend
const convertToCsv = (matches) => {
    const csvData = [];
    // Add header row
    csvData.push([
        "Student Name",
        "Student Email",
        "Mentor Name",
        "Mentor Email",
        "Matched Courses",
        "Unmatched Courses",
        "Meeting Times",
        "Match Type",
    ]);
    // Sort matches by student email to group all potential mentors for each student together
    matches.sort((a, b) => a.studentEmail.localeCompare(b.studentEmail));
    matches.forEach((match) => {
        const matchType = match.isPerfectMatch
            ? "Perfect Match"
            : match.isFlaggedMatch
                ? "Flagged Match"
                : "Partial Match";
        const formattedMatchedCourses = match.matchedCourses.join("; ");
        const formattedUnmatchedCourses = match.unmatchedCourses.join("; ");
        const formattedTimeslots = match.matchedTimeslots
            .map((slot) => `${slot.day} ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`)
            .join("; ");
        csvData.push([
            `${match.studentFirstName} ${match.studentLastName}`,
            match.studentEmail,
            `${match.mentorFirstName} ${match.mentorLastName}`,
            match.mentorEmail,
            formattedMatchedCourses,
            formattedUnmatchedCourses,
            formattedTimeslots,
            matchType,
        ]);
    });
    return csvData.map((row) => row.join(",")).join("\n");
};
// Helper function to format time
const formatTime = (time) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}${ampm}`;
};
// Function to convert unmatched students to CSV format
const convertUnmatchedToCsv = (unmatchedStudents) => {
    const csvData = [];
    // Skip header row since it will be included in the matched students CSV
    // Iterate over each unmatched student
    unmatchedStudents.forEach((student) => {
        csvData.push([
            `${student.studentFirstName} ${student.studentLastName}`,
            student.studentEmail,
            "", // No mentor name
            "", // No mentor email
            "", // No matched courses
            "", // No unmatched courses
            "", // No meeting times
            "No Match", // Match type for unmatched students
        ]);
    });
    // Convert array of arrays to CSV string
    return csvData.map((row) => row.join(",")).join("\n");
};
//# sourceMappingURL=query_controller.js.map