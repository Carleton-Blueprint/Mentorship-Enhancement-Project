import { PrismaClient, Prisma } from "@prisma/client";
import prisma from "../prismaClient";

let idNumber = 0;

interface MentorAvailability {
  [key: string]: string[];
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
  return timeSlot.replace(/_\d+$/, "");
}

function convertTimeStringToDate(timeStr: string): Date {
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

export const insertManyMentors = async (request: any, response: any) => {
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
    return response
      .status(400)
      .json({ error: "Validation error", details: validationErrors });
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

export const addMentorAvailability = async (request: any, response: any) => {
  const mentors = request.body.data;
  // console.log("request body", request.body);
  console.log("request.body.data", request.body.data);
  try {
    const updatedMentors = await addAvailability(mentors);
    response
      .status(201)
      .json({ message: "Mentor availability has been added", updatedMentors });
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

let prismaInstance: PrismaClient | null = null;

const getPrismaInstance = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
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

const addAvailability = async (mentor_data: any[]) => {
  const MAX_RETRIES = 3;
  const BATCH_SIZE = 50;
  const prisma = getPrismaInstance();

  const retryOperation = async (
    operation: () => Promise<any>,
    retries = MAX_RETRIES
  ) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        if (i === retries - 1 || !error.message?.includes("connection"))
          throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  };

  try {
    // 1. Process mentors in batches
    const mentorIds = mentor_data.map((data) => parseInt(data["Student ID"]));
    const existingMentors = await retryOperation(() =>
      prisma.mentor.findMany({
        where: {
          mentor_id: { in: mentorIds },
        },
        select: {
          id: true,
          mentor_id: true,
        },
      })
    );

    const existingMentorIds = new Set(existingMentors.map((m) => m.mentor_id));

    // Split mentors into batches
    const mentorsToCreate = mentor_data.filter(
      (data) => !existingMentorIds.has(parseInt(data["Student ID"]))
    );

    // Create mentors in batches
    for (let i = 0; i < mentorsToCreate.length; i += BATCH_SIZE) {
      const batch = mentorsToCreate.slice(i, i + BATCH_SIZE);
      await retryOperation(() =>
        prisma.mentor.createMany({
          data: batch.map((data) => ({
            mentor_id: parseInt(data["Student ID"]),
            name: data["Full Name"],
            email_address: data["Email Address"],
            Program: data.Program,
            year: data.Year,
          })),
          skipDuplicates: true,
        })
      );
    }

    // Add course handling after mentor creation
    const allCourses = new Set(
      mentor_data.flatMap((data) => data.courses || [])
    );

    // Create courses if they don't exist
    if (allCourses.size > 0) {
      await retryOperation(() =>
        prisma.course.createMany({
          data: Array.from(allCourses).map((code) => ({
            course_code: code,
            course_name: code,
          })),
          skipDuplicates: true,
        })
      );
    }

    // Get course IDs
    const courses = await retryOperation(() =>
      prisma.course.findMany({
        where: {
          course_code: { in: Array.from(allCourses) },
        },
        select: {
          id: true,
          course_code: true,
        },
      })
    );

    const courseCodeToId = new Map(courses.map((c) => [c.course_code, c.id]));

    // Create mentor-course connections
    const mentorCourseData = mentor_data
      .flatMap((data) =>
        (data.courses || []).map((course) => ({
          mentor_id: mentorIdToDbId.get(parseInt(data["Student ID"])),
          course_id: courseCodeToId.get(course),
        }))
      )
      .filter(
        (data): data is { mentor_id: number; course_id: number } =>
          data.mentor_id != null && data.course_id != null
      );

    // Create course connections in batches
    for (let i = 0; i < mentorCourseData.length; i += BATCH_SIZE) {
      const batch = mentorCourseData.slice(i, i + BATCH_SIZE);
      await retryOperation(() =>
        prisma.mentorCourse.createMany({
          data: batch,
          skipDuplicates: true,
        })
      );
      // Add small delay between batches
      if (i + BATCH_SIZE < mentorCourseData.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // 2. Process availabilities in batches
    const availabilityData = mentor_data.flatMap((data) =>
      Object.entries(data.availability as Record<string, string[]>).flatMap(
        ([day, timeSlots]) =>
          timeSlots.map((slot) => {
            const timeRange = cleanTimeSlot(slot);
            const [startTime, endTime] = timeRange.split(" to ");
            return {
              day,
              start_time: convertTimeStringToDate(startTime),
              end_time: convertTimeStringToDate(endTime),
            };
          })
      )
    );

    // Create availabilities in batches
    for (let i = 0; i < availabilityData.length; i += BATCH_SIZE) {
      const batch = availabilityData.slice(i, i + BATCH_SIZE);
      await retryOperation(() =>
        prisma.availability.createMany({
          data: batch,
          skipDuplicates: true,
        })
      );
    }

    // Get all mentor and availability IDs
    const [allMentors, allAvailabilities] = await Promise.all([
      retryOperation(() =>
        prisma.mentor.findMany({
          where: { mentor_id: { in: mentorIds } },
          select: { id: true, mentor_id: true },
        })
      ),
      retryOperation(() =>
        prisma.availability.findMany({
          where: {
            OR: availabilityData.map((avail) => ({
              AND: {
                day: avail.day,
                start_time: avail.start_time,
                end_time: avail.end_time,
              },
            })),
          },
        })
      ),
    ]);

    // Create lookup maps
    const mentorIdToDbId = new Map(allMentors.map((m) => [m.mentor_id, m.id]));
    const availabilityLookup = new Map(
      allAvailabilities.map((a) => [
        `${a.day}-${a.start_time.toISOString()}-${a.end_time.toISOString()}`,
        a.id,
      ])
    );

    // 3. Create mentor-availability connections in batches
    const mentorAvailabilityData = mentor_data
      .flatMap((data) =>
        Object.entries(data.availability as Record<string, string[]>).flatMap(
          ([day, timeSlots]) =>
            timeSlots.map((slot) => {
              const timeRange = cleanTimeSlot(slot);
              const [startTime, endTime] = timeRange.split(" to ");
              const availKey = `${day}-${convertTimeStringToDate(
                startTime
              ).toISOString()}-${convertTimeStringToDate(
                endTime
              ).toISOString()}`;
              const mentorId = mentorIdToDbId.get(parseInt(data["Student ID"]));
              const availabilityId = availabilityLookup.get(availKey);

              return {
                mentor_id: mentorId as number,
                availability_id: availabilityId as number,
              };
            })
        )
      )
      .filter(
        (data): data is { mentor_id: number; availability_id: number } =>
          data.mentor_id != null && data.availability_id != null
      );

    // Create connections in batches
    for (let i = 0; i < mentorAvailabilityData.length; i += BATCH_SIZE) {
      const batch = mentorAvailabilityData.slice(i, i + BATCH_SIZE);
      await retryOperation(() =>
        prisma.mentorAvailability.createMany({
          data: batch,
          skipDuplicates: true,
        })
      );
      // Add small delay between batches
      if (i + BATCH_SIZE < mentorAvailabilityData.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  } catch (error) {
    console.error("Error in addAvailability:", error);
    throw error;
  } finally {
    await cleanupPrisma();
  }
};

const callCreate = async (mentors: MentorData[]) => {
  try {
    console.log("Starting mentor creation with data:", mentors);

    // 1. Process all courses first
    const allCourses = new Set(
      mentors.flatMap((mentor) => mentor.courses || [])
    );
    console.log("Found courses:", Array.from(allCourses));

    // Create courses if they don't exist
    if (allCourses.size > 0) {
      const result = await prisma.$transaction(async (tx) => {
        const courseResult = await tx.course.createMany({
          data: Array.from(allCourses).map((code) => ({
            course_code: code,
            course_name: code,
          })),
          skipDuplicates: true,
        });
        console.log("Course creation result:", courseResult);

        // Get created courses within the same transaction
        const courses = await tx.course.findMany({
          where: {
            course_code: { in: Array.from(allCourses) },
          },
        });
        return courses;
      });

      console.log("Found existing courses:", result);

      // Process each mentor
      for (const mentor of mentors) {
        await prisma.$transaction(async (tx) => {
          // Create or update mentor
          const createdMentor = await tx.mentor.upsert({
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

          // Create course connections
          if (mentor.courses?.length) {
            // Delete existing connections
            await tx.mentorCourse.deleteMany({
              where: { mentor_id: createdMentor.id },
            });

            // Create new connections
            await tx.mentorCourse.createMany({
              data: mentor.courses
                .map((course) => {
                  const courseId = result.find(
                    (c) => c.course_code === course
                  )?.id;
                  return courseId
                    ? {
                        mentor_id: createdMentor.id,
                        course_id: courseId,
                      }
                    : null;
                })
                .filter(
                  (conn): conn is { mentor_id: number; course_id: number } =>
                    conn !== null
                ),
              skipDuplicates: true,
            });
          }
        });
      }
    }

    console.log("Mentor creation completed successfully");
  } catch (error) {
    console.error("Error in callCreate:", error);
    throw error;
  }
};

const callEditByID = async (mentor: any) => {
  // console.log("mentor", mentor);
  if (!mentor.mentor_id || typeof mentor.mentor_id !== "number") {
    return "Mentor id is necessary";
  }

  if (mentor.courses) {
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
      // MentorAvailability: {
      //     create: availabilityCreates,
      // },
    },
  });
};
