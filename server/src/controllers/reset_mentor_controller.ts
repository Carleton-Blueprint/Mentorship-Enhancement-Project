import prisma from '../prismaClient';

export const deleteAll = async (request: any, response: any) =>{
    try{
        console.log("Deleting all mentor data");
        callDelete();
      response
        .status(201)
        .json({ message: "All mentor data has been deleted"});
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
    if (await rowsExists('mentorCourse')) {
        const mentorCourses = await prisma.mentorCourse.findMany({
            select: {
                course_id: true,
            },
        });

        const uniqueCourseIds = new Set(mentorCourses.map(mc => mc.course_id));
        console.log(uniqueCourseIds);
        for (const course_id of uniqueCourseIds) {
    
            await prisma.course.delete({
                        where: {
                            id: course_id,
                        },
                })
        }
        await prisma.mentorCourse.deleteMany({});
    }
    if (await rowsExists('mentorAvailability')) {
        const availability = await prisma.mentorAvailability.findMany({
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
        await prisma.mentorAvailability.deleteMany({});
    }
    if (await rowsExists('mentor')) {
        await prisma.mentor.deleteMany({});
    }
}