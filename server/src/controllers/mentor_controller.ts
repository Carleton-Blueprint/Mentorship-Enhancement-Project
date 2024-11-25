import { Prisma } from '@prisma/client';
import prisma from '../prismaClient';

let idNumber = 0;

export const insertManyMentors = async (request: any, response: any) => {
  const mentors = request.body.data;

  const validationErrors = validateMentors(mentors);
  if (validationErrors.length > 0) {
    return response.status(400).json({ error: 'Validation error', details: validationErrors });
  }
  try {
    console.log("Calling create", mentors);
    const createdMentors: any = callCreate(mentors);
    response
      .status(201)
      .json({ message: "Mentors have been created", createdMentors });
  } catch (error: any) {
    console.log("entering error");
    response.status(500).json({ error: error.message });
  }
};

export const updateMentorByID = async (request: any, response: any) => {
  const mentor = request.body.data;
  const mentors = [mentor];

  const validationErrors = validateMentors(mentors);
  if (validationErrors.length > 0) {
    return response.status(400).json({ error: 'Validation error', details: validationErrors });
  }
  try {
    console.log("Calling edit", mentor);
    const editedMentor: any = callEditByID(mentor);
    response
      .status(201)
      .json({ message: "Mentor has been edited", editedMentor });
  } catch (error: any) {
    console.log("entering error");
    response.status(500).json({ error: error.message });
  }
};

// Function to perform custom validation
function validateMentors(mentors: Prisma.MentorCreateInput[]): string[] {
  const errors: string[] = [];

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

const callCreate = async (mentors: any) => {
  for (const mentor of mentors) {
    console.log("mentor XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", mentor);
    for (const course of mentor.courses) {
      // console.log("course", course);
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

    console.log("mentor.courses", mentor.courses);
    const createdMentor = await prisma.mentor.upsert({
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
    console.log("createdMentor YYYYYYYYYYYYY", createdMentor);
  }
};

const callEditByID = async (mentor: any) => {
    console.log("mentor", mentor);
    if (!mentor.mentor_id || typeof(mentor.mentor_id) !== "number") {
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
