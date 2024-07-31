import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const insertManyMentors = async (request: any, response: any) => {
    const mentors = request.body.data;
  
    const validationErrors = validateMentors(mentors);
    if (validationErrors.length > 0) {
      return response.status(400).json({ error: 'Validation error', details: validationErrors });
    }
    try {
      const createdMentors: any = await prisma.mentor.createMany({data: mentors})
      response.status(201).json({message: 'Mentors have been created', createdMentors, mentors});
    } catch (error: any) {
      response.status(500).json({error: error.message});
    }
  }
  
  // Function to perform custom validation
  function validateMentors(mentors: Prisma.MentorCreateInput[]): string[] {
    const errors: string[] = [];
  
    // Example of validation logic (you can customize this based on your requirements)
    mentors.forEach((mentor, index) => {
      if (!mentor.first_name) {
        errors.push(`Mentor at index ${index} does not have a first name.`);
      }
      if (!mentor.last_name) {
        errors.push(`Mentor at index ${index} does not have a last name.`);
      }
      if (!mentor.mentor_id) {
        errors.push("Mentor id is necessary");
      }
      if(typeof(mentor.mentor_id) !== "number") {
        errors.push('Mentor id must be a number')
      }
      if (!mentor.MentorAvailability) {
        errors.push('Must indicate mentor availibility')
      }
      if (!mentor.program) {
        errors.push('Must enter current program of education')
      }
    });
  
    return errors;
  }