import { Prisma } from "@prisma/client";
import prisma from "../prismaClient";
import { writeFile, appendFile } from "fs/promises";

interface Time {
  hours: number;
  minutes: number;
}

export const insertManyStudents = async (request: any, response: any) => {
  console.log("entering default controller");
  const students = request.body.data;
  try {
    // Process students in smaller batches
    const batchSize = 2; // Reduced from 5
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      await Promise.all(batch.map((student) => callCreate(student)));
      // Add a small delay between batches
      if (i + batchSize < students.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    response.status(201).json({ message: "Students have been created" });
  } catch (error: any) {
    console.log("entering error", error);
    response.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect(); // Ensure connection is closed
  }
};

const callCreate = async (student: any) => {
  try {
    // Batch course operations
    await Promise.all(
      student.courses.map((course) =>
        prisma.course.upsert({
          where: { course_code: course },
          create: {
            course_code: course,
            course_name: course,
          },
          update: {},
        })
      )
    );

    // Create student with relationships and handle availability
    return await prisma.student.upsert({
      where: { student_id: student.student_id },
      create: {
        student_id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        major: student.major,
        preferred_name: student.preferred_name,
        preferred_pronouns: student.preferred_pronouns,
        year_level: student.year_level,
        StudentCourse: {
          create: student.courses.map((course) => ({
            course: { connect: { course_code: course } },
          })),
        },
        StudentAvailability: {
          create: student.availability.flatMap((avail) =>
            avail.time_ranges.map((time) => ({
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
            }))
          ),
        },
      },
      update: {
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        major: student.major,
        preferred_name: student.preferred_name,
        preferred_pronouns: student.preferred_pronouns,
        year_level: student.year_level,
        StudentCourse: {
          deleteMany: {},
          create: student.courses.map((course) => ({
            course: { connect: { course_code: course } },
          })),
        },
        StudentAvailability: {
          deleteMany: {},
          create: student.availability.flatMap((avail) =>
            avail.time_ranges.map((time) => ({
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
            }))
          ),
        },
      },
    });
  } catch (error) {
    console.error("Error in callCreate:", error);
    throw error;
  }
};
// Function to perform custom validation
function validateStudents(students: Prisma.StudentCreateInput[]) {
  const errors: string[] = [];
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

function convertToDate(time: Time): Date {
  const date = new Date("2024-10-01"); // Get arbitrary date
  date.setHours(time.hours, time.minutes, 0, 0); // Set the hours, minutes, seconds, and milliseconds
  return date;
}

// Inserting a student from front-end
export const insertStudent = async (request: any, response: any) => {
  const studentCamelCase = request.body.data;
  const studentJSON = convertToBackEndFormat(studentCamelCase);

  const validationErrors = validateStudent(studentJSON);

  if (validationErrors.length > 0) {
    return response
      .status(400)
      .json({ error: "Validation error", details: validationErrors });
  }

  try {
    const createdStudent: any = createStudent(studentJSON);
    response
      .status(201)
      .json({ message: "Student has been created", createdStudent });
  } catch (error: any) {
    response.status(500).json({ error: error.message });
  }
};

const createStudent = async (student: any) => {
  const avail = convertAvailabilityToPrismaData(student["StudentAvailability"]);
  console.log(`studentJSON: ${JSON.stringify(student)}`);
  // adds courses to database
  for (const course of student["StudentCourse"]) {
    await prisma.course.upsert({
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
    await prisma.availability.upsert({
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

  const createdStudent = await prisma.student.upsert({
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
        create: student.availability.flatMap((avail) =>
          avail.time_ranges.map((time) => ({
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
          }))
        ),
      },
    },
  });
};

function convertAvailabilityToPrismaData(availabilityArray: boolean[][]) {
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
    for (
      let timeslot = 0;
      timeslot < availabilityArray[day].length;
      timeslot++
    ) {
      if (availabilityArray[day][timeslot]) {
        const startTime = new Date("2024-10-01");
        startTime.setHours(
          itoSlot[timeslot]["hours"],
          itoSlot[timeslot]["minutes"],
          0,
          0
        );
        const endTime = new Date("2024-10-01");
        endTime.setHours(
          itoSlot[timeslot]["hours"],
          itoSlot[timeslot]["minutes"] + 30,
          0,
          0
        );

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

function validateStudent(
  student: Partial<Prisma.StudentCreateInput>
): string[] {
  const errors: string[] = [];
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
