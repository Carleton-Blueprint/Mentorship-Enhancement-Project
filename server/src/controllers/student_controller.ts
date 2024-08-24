import { PrismaClient, Prisma } from "@prisma/client";
import yaml from "js-yaml";
import { writeFile, appendFile } from "fs/promises";

const prisma = new PrismaClient();

interface TimeRange {
  startTime: Date;
  endTime: Date;
}

interface Time {
  hours: number;
  minutes: number;
}

export const insertManyStudents = async (request: any, response: any) => {
  console.log("entering default controller");
  const students = request.body.data;
  // Write to the file (replaces the file if it exists)
  try {
    await writeFile("output.txt", JSON.stringify(students));
    console.log("File written successfully");
  } catch (err) {
    console.error("Error writing to file", err);
  }

  // const validationErrors = validateStudents(students);
  // if (validationErrors.length > 0) {
  //   return response
  //     .status(400)
  //     .json({ error: "Validation error", details: validationErrors });
  // }
  try {
    const createdStudents: any = callCreate(students);
    response
      .status(201)
      .json({ message: "Students have been created", createdStudents });
  } catch (error: any) {
    console.log("entering error");
    response.status(500).json({ error: error.message });
  }
};

function parseTimeRange(timeRangeStr: string): TimeRange {
  const [startTimeStr, endTimeStr] = timeRangeStr
    .split(" to ")
    .map((time) => time.trim());

  const parseTime = (timeStr: string): Date => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    } else if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  return {
    startTime: parseTime(startTimeStr),
    endTime: parseTime(endTimeStr),
  };
}

const callCreate = async (students: any) => {
  for (const student of students) {
    console.log("student", student);
    for (const course of student.courses) {
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

    // Insert availabilities
    for (const avail of student.availability) {
      console.log("avail", avail);
      for (const time of avail.time_ranges) {
        await prisma.availability.upsert({
          where: {
            unique_avail: {
              day: avail.day,
              start_time: convertToDate(time.start_time),
              end_time: convertToDate(time.end_time),
            },
          },
          update: {},
          create: {
            day: avail.day,
            start_time: convertToDate(time.start_time),
            end_time: convertToDate(time.end_time),
          },
        });
      }
    }

    // Insert student and link courses and availabilities
    const createdStudent = await prisma.student.upsert({
      where: { student_id: student.student_id },
      update: {},
      create: {
        student_id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        StudentCourse: {
          create: student.courses.map((course) => ({
            course: { connect: { course_code: course } },
          })),
        },
        StudentAvailability: {
          create: student.availability.flatMap((avail) =>
            avail.time_ranges.map((time) => ({
              availability: {
                connect: {
                  unique_avail: {
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
  const date = new Date(); // Get the current date
  date.setHours(time.hours, time.minutes, 0, 0); // Set the hours, minutes, seconds, and milliseconds
  return date;
}
