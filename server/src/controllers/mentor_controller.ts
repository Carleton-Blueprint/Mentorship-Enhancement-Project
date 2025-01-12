import { Prisma } from "@prisma/client";
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

const addAvailability = async (mentor_data: any[]) => {
  try {
    // 1. First ensure all mentors exist
    const mentorIds = mentor_data.map((data) => parseInt(data["Student ID"]));
    const existingMentors = await prisma.mentor.findMany({
      where: {
        mentor_id: { in: mentorIds },
      },
      select: {
        id: true,
        mentor_id: true,
      },
    });

    const mentorIdToDbId = new Map(
      existingMentors.map((m) => [m.mentor_id, m.id])
    );

    // 2. Process all availabilities
    const availabilityData = mentor_data.flatMap((data) =>
      Object.entries(data.availability as Record<string, string[]>).flatMap(([day, timeSlots]) =>
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

    // 3. Create or get all availabilities
    const existingAvailabilities = await prisma.availability.findMany({
      where: {
        OR: availabilityData.map((avail) => ({
          AND: {
            day: avail.day,
            start_time: avail.start_time,
            end_time: avail.end_time,
          },
        })),
      },
      select: {
        id: true,
        day: true,
        start_time: true,
        end_time: true,
      },
    });

    const existingAvailabilityKeys = new Set(
      existingAvailabilities.map(
        (a) =>
          `${a.day}-${a.start_time.toISOString()}-${a.end_time.toISOString()}`
      )
    );

    const newAvailabilities = availabilityData.filter(
      (a) =>
        !existingAvailabilityKeys.has(
          `${a.day}-${a.start_time.toISOString()}-${a.end_time.toISOString()}`
        )
    );

    if (newAvailabilities.length > 0) {
      await prisma.availability.createMany({
        data: newAvailabilities,
        skipDuplicates: true,
      });
    }

    // 4. Get all availabilities after creation
    const allAvailabilities = await prisma.availability.findMany({
      where: {
        OR: availabilityData.map((avail) => ({
          AND: {
            day: avail.day,
            start_time: avail.start_time,
            end_time: avail.end_time,
          },
        })),
      },
    });

    // Create availability lookup map
    const availabilityLookup = new Map(
      allAvailabilities.map((a) => [
        `${a.day}-${a.start_time.toISOString()}-${a.end_time.toISOString()}`,
        a.id,
      ])
    );

    // 5. Create mentor-availability connections
    const mentorAvailabilityData = mentor_data
      .flatMap((data) =>
        Object.entries(data.availability as Record<string, unknown[]>).flatMap(([day, timeSlots]) =>
          timeSlots.map((slot: unknown) => {
            const timeRange = cleanTimeSlot(slot as string);
            const [startTime, endTime] = timeRange.split(" to ");
            const availKey = `${day}-${convertTimeStringToDate(
              startTime
            ).toISOString()}-${convertTimeStringToDate(endTime).toISOString()}`;
            return {
              mentor_id: mentorIdToDbId.get(parseInt(data["Student ID"])),
              availability_id: availabilityLookup.get(availKey),
            };
          })
        )
      )
      .filter((data) => data.mentor_id != null && data.availability_id != null);

    // Bulk create mentor-availability connections
    if (mentorAvailabilityData.length > 0) {
      await prisma.mentorAvailability.createMany({
        data: mentorAvailabilityData,
        skipDuplicates: true,
      });
    }
  } catch (error) {
    console.error("Error in addAvailability:", error);
    throw error;
  }
};

const callCreate = async (mentors: MentorData[]) => {
  for (const mentor of mentors) {
    // console.log("mentor XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", mentor);
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

    console.log("Processing mentor:", mentor.mentor_id);

    // Create or update mentor
    const createdMentor = await prisma.mentor.upsert({
      where: {
        mentor_id: mentor.mentor_id,
      },
      update: {
        // Update only provided fields, preserve existing ones
        ...(mentor.name && { name: mentor.name }),
        ...(mentor.email_address && { email_address: mentor.email_address }),
        ...(mentor.program && { Program: mentor.program }),
        ...(mentor.year && { year: mentor.year }),

        // If courses provided, update courses
        ...(mentor.courses?.length > 0 && {
          MentorCourse: {
            deleteMany: {},
            create: mentor.courses.map((course) => ({
              course: { connect: { course_code: course } },
            })),
          },
        }),

        // If availability provided, update availability
        ...(Object.keys(mentor.availability || {}).length > 0 && {
          MentorAvailability: {
            deleteMany: {},
            create: Object.entries(mentor.availability).flatMap(
              ([day, slots]) =>
                slots.map((slot) => {
                  const cleanedSlot = cleanTimeSlot(slot);
                  const [startTime, endTime] = cleanedSlot.split(" to ");
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
        }),
      },
      create: {
        mentor_id: mentor.mentor_id,
        name: mentor.name,
        email_address: mentor.email_address,
        Program: mentor.program,
        year: mentor.year,
        ...(mentor.courses?.length > 0 && {
          MentorCourse: {
            create: mentor.courses.map((course) => ({
              course: { connect: { course_code: course } },
            })),
          },
        }),
        ...(Object.keys(mentor.availability || {}).length > 0 && {
          MentorAvailability: {
            create: Object.entries(mentor.availability).flatMap(
              ([day, slots]) =>
                slots.map((slot) => {
                  const cleanedSlot = cleanTimeSlot(slot);
                  const [startTime, endTime] = cleanedSlot.split(" to ");
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
        }),
      },
    });

    console.log("Mentor processed:", createdMentor.mentor_id);
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
