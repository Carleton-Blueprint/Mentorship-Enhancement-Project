import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const insertManyStudents = async (request: any, response: any) => {
  const students = request.body.data;
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
    // Add more validation rules as needed
  });

  return errors;
}