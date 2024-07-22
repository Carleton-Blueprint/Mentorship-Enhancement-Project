import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const insertStudent = async (request: any, response: any) => {
    const studentCamelCase = request.body.data;
    const studentJSON = convertKeysToSnakeCase(studentCamelCase)

    // convert from string to int
    studentJSON["student_id"] = Number(studentJSON["student_id"])

    // placeholders below to prevent errors
    delete studentJSON["courses"];
    delete studentJSON["availability"];
    console.log(studentJSON)
    try{
        const createUser = await prisma.student.create({ data: studentJSON })
        response.status(201).json({message: 'Student has been created', createUser});

    } catch (error: any){
        response.status(500).json({error: error.message});
    }
}

function camelToSnakeCase(str) {
    if (str == "entityNumber"){
        return 'student_id';
    }
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function convertKeysToSnakeCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map(val => convertKeysToSnakeCase(val));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce(
            (acc, key) => ({
                ...acc,
                [camelToSnakeCase(key)]: convertKeysToSnakeCase(obj[key])
            }),
            {}
        );
    }
    return obj;
}