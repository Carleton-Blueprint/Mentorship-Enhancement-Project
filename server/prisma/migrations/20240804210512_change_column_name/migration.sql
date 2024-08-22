/*
  Warnings:

  - You are about to drop the column `start_tme` on the `Availability` table. All the data in the column will be lost.
  - Added the required column `start_time` to the `Availability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "start_tme",
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL;
