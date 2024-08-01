import { PrismaClient, Prisma } from '@prisma/client';
import yaml from 'js-yaml';

const prisma = new PrismaClient();

export const insertManyStudents = async (request: any, response: any) => {
  console.log("entering default controller")
  const students = request.body.data;
  console.log("students", students)

  const validationErrors = validateStudents(students);
  if (validationErrors.length > 0) {
    return response.status(400).json({ error: 'Validation error', details: validationErrors });
  }
  try {
    const createdStudents: any = await prisma.student.createMany({data: students})
    response.status(201).json({message: 'Students have been created', createdStudents});
  } catch (error: any) {
    response.status(500).json({error: error.message});
  }
}

// Function to perform custom validation
function validateStudents(students: Prisma.StudentCreateInput[]): string[] {
  const errors: string[] = [];

  // Example of validation logic (you can customize this based on your requirements)
  students.forEach((student, index) => {
    if (!student.first_name) {
      errors.push(`Student at index ${index} does not have a name.`);
    }
    if (!student.student_id) {
      errors.push("Student id is necessary");
    }
    if(typeof(student.student_id) !== "number") {
      errors.push('Student id must be a number')
    }
    if (!student.StudentAvailability) {
      errors.push('Must indicate student availibility')
    }
  });

  return errors;
}