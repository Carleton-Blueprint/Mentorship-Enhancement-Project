import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Creation of a mentor
export const createMentor = async (req: any, res: any) => {
  // Extract mentor details
  const {
    name, email_address, mentor_id, year, Program, availability,
  } = req.body;

  // Validate the mentor data
  const validationErrors = validateMentor({
    name,
    email_address,
    mentor_id,
    year,
    Program,
    MentorAvailability: availability, 
  });

  // If there are validation errors, return a 400 status with the errors
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Validation error', details: validationErrors });
  }

  try {
    // Create the mentor in the database
    const createdMentor = await prisma.mentor.create({
      data: {
        name,
        email_address,
        mentor_id,
        year,
        Program,
        MentorAvailability: {
          // Create availability records for the mentor
          create: availability.map((timeSlot: any) => ({
            availability: {
              create: {
                start_tme: new Date(timeSlot.start),
                end_time: new Date(timeSlot.end),
              },
            },
          })),
        },
      },
    });
    // Return a 201 status with the created mentor
    res.status(201).json({ message: 'Mentor has been created', createdMentor });
  } catch (error: any) {
    // If there is an error
    res.status(500).json({ error: error.message });
  }
};

// Function to validate mentor data
function validateMentor(mentor: Partial<Prisma.MentorCreateInput>): string[] {
  const errors: string[] = [];

  // Check if required fields are present and valid
  if (!mentor.name) {
    errors.push("Name is required.");
  }
  if (!mentor.email_address) {
    errors.push("Email address is required.");
  }
  if (!mentor.mentor_id) {
    errors.push("Mentor ID is required.");
  }
  if (typeof mentor.mentor_id !== 'number') {
    errors.push("Mentor ID must be a number.");
  }
  if (!mentor.year) {
    errors.push("Year is required.");
  }
  if (!mentor.Program) {
    errors.push("Program is required.");
  }
  if (!mentor.MentorAvailability || !Array.isArray(mentor.MentorAvailability) || mentor.MentorAvailability.length === 0) {
    errors.push("Availability is required and must have at least one time slot.");
  }

  return errors;
}
