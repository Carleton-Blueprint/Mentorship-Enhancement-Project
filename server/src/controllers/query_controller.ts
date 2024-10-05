import { PrismaClient, Prisma } from "@prisma/client";
import { writeFile, appendFile } from "fs/promises";

const prisma = new PrismaClient();

export const generateCsv = async (request, response) => {

   // Match all students with mentors
   const { matches, unmatchedStudents } = await findMatches();
   let csvContent = "";
   let unmatchedCsvContent = "";

   if (matches.length > 0) {
     // Convert matches to CSV format
     csvContent = convertToCsv(matches);
 
     // Here you would send the csvContent to the frontend (e.g., through an API response)
     console.log("CSV Content for Matched:\n", csvContent);
   } else {
     console.log('No students were matched with mentors.');
   }
 
   if (unmatchedStudents.length > 0) {
     // Convert unmatched students to CSV format
     unmatchedCsvContent = convertUnmatchedToCsv(unmatchedStudents);
 
     // Here you would send the unmatchedCsvContent to the frontend (e.g., through an API response)
     console.log("CSV Content for Unmatched Students:\n", unmatchedCsvContent);
   } else {
     console.log('All students were matched with mentors.');
   }

  const content = {csvContent, unmatchedCsvContent};
  // console.log("csvContent", csvContent);
  // console.log("unmatchedCsvContent", unmatchedCsvContent);
  console.log("content", content);

  try {
    return response.status(200).json(content);
  } catch (error) {
    console.log("error returning csv output");
    return response.status(500).json({ message: "Internal server error" });
  }
};

const findMatches = async () => {
  try {
    // Fetch all students with their courses
    const students = await prisma.student.findMany({
      include: {
        StudentCourse: {
          include: {
            course: true, // Include course details
          },
        },
      },
    });

    let matches = [];
    let unmatchedStudents = [];

    // Loop through each student
    for (const student of students) {
      const studentCourseIds = student.StudentCourse.map((sc) => sc.course_id);

      // Find all mentors who have taken any of the student's courses
      const mentors = await prisma.mentor.findMany({
        where: {
          MentorCourse: {
            some: {
              course_id: { in: studentCourseIds }, // At least one matching course
            },
          },
        },
        include: {
          MentorCourse: {
            include: {
              course: true, // Include course details
            },
          },
        },
      });

      // Find the mentor with the most overlapping courses
      let bestMentor = null;
      let maxOverlap = 0;

      mentors.forEach((mentor) => {
        const mentorCourseIds = mentor.MentorCourse.map((mc) => mc.course_id);
        const overlappingCourses = studentCourseIds.filter((courseId) =>
          mentorCourseIds.includes(courseId)
        );

        if (overlappingCourses.length > maxOverlap) {
          bestMentor = mentor;
          maxOverlap = overlappingCourses.length;
        }
      });

      if (bestMentor && maxOverlap > 0) {
        // Record the best match (student to mentor with most overlapping courses)
        const matchedCourses = student.StudentCourse.filter((sc) =>
          bestMentor.MentorCourse.some((mc) => mc.course_id === sc.course_id)
        );

        matches.push({
          studentId: student.student_id,
          studentEmail: student.email,
          studentFirstName: student.first_name,
          studentLastName: student.last_name,
          mentorId: bestMentor.mentor_id,
          mentorFirstName: bestMentor.name.split(" ")[0], // Assuming first name is first in the full name
          mentorLastName: bestMentor.name.split(" ")[1], // Assuming last name is second
          mentorEmail: bestMentor.email_address,
          courseName: matchedCourses
            .map((mc) => mc.course.course_name)
            .join(", "), // List of matched courses
        });
      } else {
        // If no mentor is found, mark the student as unmatched
        unmatchedStudents.push({
          studentId: student.student_id,
          studentEmail: student.email,
          studentFirstName: student.first_name,
          studentLastName: student.last_name,
        });
      }
    }

    return { matches, unmatchedStudents };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to match students with mentors");
  }
};


// Function to convert matches to CSV format for frontend
const convertToCsv = (matches) => {
  const csvData = [];

  // Add header row
  csvData.push(["Student Name", "Student Email", "Mentor Name", "Mentor Email", "Courses in Common"]);
  
  // Iterate over each match and extract the required information
  matches.forEach((match) => {
    csvData.push([
      `${match.studentFirstName} ${match.studentLastName}`,  // Student's full name
      match.studentEmail,                                   // Student's email
      `${match.mentorFirstName} ${match.mentorLastName}`,    // Mentor's full name
      match.mentorEmail,                                    // Mentor's email
      match.courseName,                                     // List of courses in common
    ]);
  });

  // Convert array of arrays to CSV string
  const csvContent = csvData.map((row) => row.join(",")).join("\n");
  return csvContent;
};

// Function to convert unmatched students to CSV format
const convertUnmatchedToCsv = (unmatchedStudents) => {
  const csvData = [];

  // Add header row
  csvData.push(["Student First Name", "Student Last Name", "Student Email", "Mentor First Name", "Mentor Last Name", "Mentor Email"]);
  
  // Iterate over each unmatched student and generate empty mentor info
  unmatchedStudents.forEach((student) => {
    csvData.push([
      student.studentFirstName,  // Student's first name
      student.studentLastName,   // Student's last name
      student.studentEmail,      // Student's email
      "",                        // No mentor first name (unmatched)
      "",                        // No mentor last name (unmatched)
      ""                         // No mentor email (unmatched)
    ]);
  });

  // Convert array of arrays to CSV string
  const csvContent = csvData.map((row) => row.join(",")).join("\n");
  return csvContent;
};