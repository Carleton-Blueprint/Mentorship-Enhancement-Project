import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const insertStudent = async (request: any, response: any) => {
    const student = request.body.data;
    console.log(student)
    try{
        console.log("In the server")
    } catch (error: any){
        response.status(500).json({error: error.message});
    }
}

//function validateStudent