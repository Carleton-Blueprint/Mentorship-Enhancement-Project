import { Prisma } from '@prisma/client';
import prisma from '../prismaClient';

let idNumber = 0;

interface MentorAvailability {
  [key: string]: string[]
}

interface MentorData {
  mentor_id: number;
  name: string;
  email_address: string;
  program: string;
  year: string;
  courses: string[];
  availability: MentorAvailability;
}

function cleanTimeSlot(timeSlot: string): string {
  // Remove _N suffix from timeslots (e.g., "10:00am to 10:30am_1" -> "10:00am to 10:30am")
  return timeSlot.replace(/_\d+$/, '');
}

function convertTimeStringToDate(timeStr: string): Date {  
  // Parse time (assuming 12-hour format)
  const [hourMin, period] = timeStr.split(/(?=[ap]m)/i);
  const [hours, minutes] = hourMin.split(':');
  // Convert to 24-hour format
  let hour = parseInt(hours);
  if (period.toLowerCase() === 'pm' && hour !== 12) { hour += 12; }
  if (period.toLowerCase() === 'am' && hour === 12) { hour = 0; }
  // Set the date to a fixed value (e.g., 2024-02-01) for consistent parsing
  const date = new Date(2024, 1, 1);
  date.setHours(hour, parseInt(minutes), 0, 0);
  return date;
}

export const insertManyMentors = async (request: any, response: any) => {
  const mentors = request.body.data;

  const validationErrors = validateMentors(mentors);
  if (validationErrors.length > 0) {
    return response.status(400).json({ error: 'Validation error', details: validationErrors });
  }
  try {
    console.log("Calling create mentors", mentors);
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

const callCreate = async (mentors: MentorData[]) => {
  for (const mentor of mentors) {
    console.log("mentor XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", mentor);
    for (const course of mentor.courses) {
      await prisma.course.upsert({
        where: { course_code: course },
        create: {
          course_code: course,
          course_name: course,
        },
        update: {},
      });
    }
    for (const day of Object.keys(mentor.availability)) {
      for (const timeslot of mentor.availability[day]) {
        const timeRange = cleanTimeSlot(timeslot);
        const [startTime, endTime] = timeRange.split(' to ');
        await prisma.availability.upsert({
          where: {
            unique_avail: {
              day: day,
              start_time: convertTimeStringToDate(startTime),
              end_time: convertTimeStringToDate(endTime),
            },
          },
          create: {
            day: day,
            start_time: convertTimeStringToDate(startTime),
            end_time: convertTimeStringToDate(endTime),
          },
          update: {},
        });
      }
    }

    console.log("mentor.courses", mentor.courses);
    console.log("mentor.availability", mentor.availability);

    // Create mentor with relationships
    const createdMentor = await prisma.mentor.upsert({
      where: { mentor_id: idNumber },
      update: {
        name: mentor.name,
        email_address: mentor.email_address,
        Program: mentor.program,
        year: mentor.year,
        MentorCourse: {
          deleteMany: {},
          create: mentor.courses.map(course => ({
            course: { connect: { course_code: course } },
          })),
        },
        MentorAvailability: {
          deleteMany: {},
          create: Object.entries(mentor.availability).flatMap(([day, slots]) =>
              slots.map(slot => {
              const cleanedSlot = cleanTimeSlot(slot);
              const [startTime, endTime] = cleanedSlot.split(' to ');
              return {
                availability: {
                  connect: {
                    unique_avail: {
                      day,
                      start_time: convertTimeStringToDate(startTime),
                      end_time: convertTimeStringToDate(endTime),
                    },
                  },
                },
              };
            })
          ),
        },
      },
      create: {
        mentor_id: idNumber,
        name: mentor.name,
        email_address: mentor.email_address,
        Program: mentor.program,
        year: mentor.year,
        MentorCourse: {
          create: mentor.courses.map(course => ({
            course: { connect: { course_code: course } },
          })),
        },
        MentorAvailability: {
          create: Object.entries(mentor.availability).flatMap(([day, slots]) =>
              slots.map(slot => {
              const cleanedSlot = cleanTimeSlot(slot);
              const [startTime, endTime] = cleanedSlot.split(' to ');
              return {
                availability: {
                  connect: {
                    unique_avail: {
                      day,
                      start_time: convertTimeStringToDate(startTime),
                      end_time: convertTimeStringToDate(endTime),
                    },
                  },
                },
              };
            })
          ),
        },
      },
    });

    idNumber += 1;
    console.log("Created mentor:", createdMentor);
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

    // probably won't work
    // const availabilityCreates = [];
    // for (const [day, slots] of Object.entries(mentor.availability as MentorAvailability)) {
    //   for (const slot of slots) {
    //     const cleanedSlot = cleanTimeSlot(slot);
    //     const [startTime, endTime] = cleanedSlot.split(" to ");
    //     availabilityCreates.push({
    //       day: day,
    //       start_time: startTime,
    //       end_time: endTime
    //     });
    //   }
    // }

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
            // MentorAvailability: {
            //     create: availabilityCreates,
            // },
        },
    });
};
