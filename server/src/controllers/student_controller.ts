import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const insertStudent = async (request: any, response: any) => {
    const studentCamelCase = request.body.data;
    const studentJSON = convertToBackEndFormat(studentCamelCase)
    
    try {
        const createUser = await prisma.student.create({ data: studentJSON })
        response.status(201).json({ message: 'Student has been created', createUser });
    } catch (error: any) {
        response.status(500).json({ error: error.message });
    }
}

// Simple function to understand, but must be manually updated
function convertToBackEndFormat(student) {
    return {
        "student_id": Number(student["entityNumber"]),
        "first_name": student["firstName"],
        "last_name": student["lastName"],
        "major": student["major"],
        "preferred_name": student["preferredName"],
        "preferred_pronouns": student["preferredPronouns"],
        "email": student["email"],
        "year_level": student["yearLevel"]
    }
}

// Below is more complicated, but technically more adaptable
function camelToSnakeCase(str) {
    if (str == "entityNumber") {
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