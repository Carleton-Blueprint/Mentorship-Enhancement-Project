import { PrismaClient, Prisma } from "@prisma/client";
import { writeFile, appendFile } from "fs/promises";

const prisma = new PrismaClient();

export const generateCsv = async (request, response) => {
  const matches = await findMatches();
  updateMentorPairings(matches);

  const csvContent = convertToCsv(matches);
  console.log('csvContent', csvContent);


  try {
    return response.status(200).json(csvContent);
  } catch (error) {
    console.log("error returning csv output");
    return response.status(500).json({ message: "Internal server error" });
  }
};

const findMatches = async () => {
  const mentorsWithMatchingStudents = await prisma.mentor.findMany({
    // take: 10,
    include: {
      MentorCourse: {
        include: {
          course: {
            include: {
              StudentCourse: {
                include: {
                  student: true,
                },
              },
            },
          },
        },
      },
    },
    where: {
      MentorCourse: {
        some: {
          course: {
            StudentCourse: {
              some: {},
            },
          },
        },
      },
    },
  });
  console.log("mentorsWithMatchingStudents", mentorsWithMatchingStudents);
  return mentorsWithMatchingStudents;
};

// Update the Pairings column for each mentor
const updateMentorPairings = async (matches: any) => {
  for (const mentor of matches) {
    await prisma.mentor.update({
      where: {
        id: mentor.id,
      },
      data: {
        Pairings: {
          increment: 1,
        },
      },
    });
  }
}

const convertToCsv = (matches: any) => {
  const csvData = [];
  csvData.push(["Student Name", "Mentor Name", "Course in Common"]);
  matches.forEach((mentor) => {
    mentor.MentorCourse.forEach((mentorCourse) => {
      mentorCourse.course.StudentCourse.forEach((studentCourse) => {
        csvData.push([
          `${studentCourse.student.first_name} ${studentCourse.student.last_name}`,
          mentor.name, // Mentor name
          mentorCourse.course.course_name, // Course in common
        ]);
      });
    });
  });

  const csvContent = csvData.map((row) => row.join(",")).join("\n");
  return csvContent;

  //logging
  // await writeFile("mentors_students_courses.csv", csvContent);
  // console.log("CSV file generated: mentors_students_courses.csv");
};
