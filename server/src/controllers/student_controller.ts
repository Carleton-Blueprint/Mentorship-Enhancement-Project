import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const insertStudent = async (request: any, response: any) => {
    const studentAdded = request.body.data;
    console.log(studentAdded)
    try{
        const createUser = await prisma.student.create({ data: studentAdded })
        response.status(201).json({message: 'Student has been created', createUser});

    } catch (error: any){
        response.status(500).json({error: error.message});
    }
}

//function validateStudent