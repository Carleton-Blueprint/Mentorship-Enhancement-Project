/*
  Warnings:

  - A unique constraint covering the columns `[day,start_time,end_time]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Availability_day_start_time_end_time_key" ON "Availability"("day", "start_time", "end_time");
