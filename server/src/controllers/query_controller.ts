import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const generateCsv = async (request, response) => {
  // Match all students with mentors
  const { matches, unmatchedStudents } = await findMatches();
  let csvContent = "";
  let unmatchedCsvContent = "";

  if (matches.length > 0) {
    // Convert matches to CSV format
    csvContent = convertToCsv(matches);

    // Send the csvContent to the frontend (e.g., through an API response)
    console.log("CSV Content for Matched:\n", csvContent);
  } else {
    console.log("No students were matched with mentors.");
  }

  if (unmatchedStudents.length > 0) {
    // Convert unmatched students to CSV format
    unmatchedCsvContent = convertUnmatchedToCsv(unmatchedStudents);

    // Send the unmatchedCsvContent to the frontend
    console.log("CSV Content for Unmatched Students:\n", unmatchedCsvContent);
  } else {
    console.log("All students were matched with mentors.");
  }

  const content = { csvContent, unmatchedCsvContent };
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
      console.log("studentCourseIds", studentCourseIds);

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

      console.log("mentors", mentors.length);

      // If there are no mentors, mark the student as unmatched
      if (mentors.length === 0) {
        unmatchedStudents.push({
          studentId: student.student_id,
          studentEmail: student.email,
          studentFirstName: student.first_name,
          studentLastName: student.last_name,
        });
        continue;
      }

      // Collect all compatible mentors for the student
      const compatibleMentors = mentors.map((mentor) => {
        const mentorCourseIds = mentor.MentorCourse.map((mc) => mc.course_id);
        const overlappingCourses = studentCourseIds.filter((courseId) =>
          mentorCourseIds.includes(courseId)
        );

        const matchedCourses = mentor.MentorCourse.filter((mc) =>
          overlappingCourses.includes(mc.course_id)
        );

        return {
          mentorId: mentor.mentor_id,
          mentorFirstName: mentor.name.split(" ")[0],
          mentorLastName: mentor.name.split(" ")[1] || "",
          mentorEmail: mentor.email_address,
          courseNames: matchedCourses
            .map((mc) => mc.course.course_name)
            .join(", "),
        };
      });

      // Record all compatible mentors for the student
      matches.push({
        studentId: student.student_id,
        studentEmail: student.email,
        studentFirstName: student.first_name,
        studentLastName: student.last_name,
        mentors: compatibleMentors,
      });
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
  csvData.push([
    "Student Name",
    "Student Email",
    "Mentor Name",
    "Mentor Email",
    "Courses in Common",
  ]);

  // Iterate over each match and extract the required information
  matches.forEach((match) => {
    if (match.mentors && match.mentors.length > 0) {
      match.mentors.forEach((mentor) => {
        csvData.push([
          `${match.studentFirstName} ${match.studentLastName}`, // Student's full name
          match.studentEmail, // Student's email
          `${mentor.mentorFirstName} ${mentor.mentorLastName}`, // Mentor's full name
          mentor.mentorEmail, // Mentor's email
          mentor.courseNames, // List of matched courses
        ]);
      });
    }
  });

  // Convert array of arrays to CSV string
  const csvContent = csvData.map((row) => row.join(",")).join("\n");
  return csvContent;
};

// Function to convert unmatched students to CSV format
const convertUnmatchedToCsv = (unmatchedStudents) => {
  const csvData = [];

  // Add header row
  csvData.push([
    "Student First Name",
    "Student Last Name",
    "Student Email",
  ]);

  // Iterate over each unmatched student
  unmatchedStudents.forEach((student) => {
    csvData.push([
      student.studentFirstName, // Student's first name
      student.studentLastName, // Student's last name
      student.studentEmail, // Student's email
    ]);
  });

  // Convert array of arrays to CSV string
  const csvContent = csvData.map((row) => row.join(",")).join("\n");
  return csvContent;
};
