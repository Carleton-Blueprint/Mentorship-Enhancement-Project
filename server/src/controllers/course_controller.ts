import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
let idNumber = 0;

export const addCourse = async (request: any, response: any) => {
  const data = request.body.data;

  // const validationErrors = validateMentors(mentors);
  // if (validationErrors.length > 0) {
  //   return response.status(400).json({ error: 'Validation error', details: validationErrors });
  // }
  try {
    const createdCourse: any = callCreateCourse(data.courses);
    response
      .status(201)
      .json({ message: "Course has been created", createdCourse });
  } catch (error: any) {
    console.log("entering error");
    response.status(500).json({ error: error.message });
  }
};

const callCreateCourse = async (courses: any) => {
  console.log("data", courses);
  const createdCourse = await prisma.course.create({
    data: {
      course_code: courses.courseCode,
      course_name: courses.courseName,
    },
  });
  console.log("createdCourse", createdCourse);
};
