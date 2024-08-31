import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const addDateRange = async (request: any, response: any) => {
    const dateRange = request.body.data;
  
    // if (validationErrors.length > 0) {
    //   return response.status(400).json({ error: 'Validation error', details: validationErrors });
    // }
    try {
      const createdDateRange: any = callCreateDateRange(start_time, end_time);
      response
        .status(201)
        .json({ message: "date range has been created", createdDateRange});
    } catch (error: any) {
      console.log("entering error");
      response.status(500).json({ error: error.message });
    }
  };
  

  const callCreateDateRange = async (start_time: any, end_time) => {
    const createdDateRange = await prisma.dateRange.create({
        data: {
            start_time: start_time,
            end_time: end_time,
        }
    });
  };
