import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const deleteAll = async (request: any, response: any) =>{
    try{
        console.log("Deleting all student data");
        callDelete();
      response
        .status(201)
        .json({ message: "All data has been deleted"});
    }catch(error:any){
        console.log("entering error");
        response.status(500).json({ error: error.message });
    }
}

const rowsExists = async (tableName: string): Promise<boolean> => {
    const count = await prisma[tableName].count();
    return count > 0;
};
  

const callDelete = async () => {
    if (await rowsExists('studentCourse')) {
        const studentCourses = await prisma.studentCourse.findMany({
            select: {
                course_id: true,
            },
        });

        const uniqueCourseIds = new Set(studentCourses.map(mc => mc.course_id));
        console.log(uniqueCourseIds);
        for (const course_id of uniqueCourseIds) {
            await prisma.course.delete({
                        where: {
                            id: course_id,
                        },
                })
        }
        await prisma.studentCourse.deleteMany({});
    }
    if (await rowsExists('studentAvailability')) {
        const availability = await prisma.studentAvailability.findMany({
            select: {
                availability_id: true,
            },
        });
        const uniqueAvailability = new Set(availability.map(mc => mc.availability_id));
        for (const availability_id of uniqueAvailability) {
    
            await prisma.course.delete({
                        where: {
                            id: availability_id,
                        },
                })
        }
        await prisma.studentAvailability.deleteMany({});
    }
    if (await rowsExists('student')) {
        await prisma.student.deleteMany({});
    }
}