import prisma from '../prismaClient';

export const addDateRange = async (request: any, response: any) => {
    const data = request.body.data;
  
    // if (validationErrors.length > 0) {
    //   return response.status(400).json({ error: 'Validation error', details: validationErrors });
    // }
    try {
      const createdDateRange: any = callCreateDateRange(data.dates);
      response
        .status(201)
        .json({ message: "date range has been created", createdDateRange});
    } catch (error: any) {
      console.log("entering error");
      response.status(500).json({ error: error.message });
    }
  };
  

  const callCreateDateRange = async (dateRange: any) => {
    console.log("dateRange", dateRange);
    const createdDateRange = await prisma.dateRange.create({
        data: {
            start_time: dateRange.startDate,
            end_time: dateRange.endDate,
        }
    });
    console.log("createdDateRange", createdDateRange)
  };
