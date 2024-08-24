/*
  Warnings:

  - A unique constraint covering the columns `[day,start_time,end_time]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `day` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `Availability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Availability" ADD COLUMN     "day" TEXT NOT NULL,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Availability_day_start_time_end_time_key" ON "Availability"("day", "start_time", "end_time");
