/*
  Warnings:

  - You are about to alter the column `mentor_id` on the `Mentor` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Mentor" ALTER COLUMN "mentor_id" SET DATA TYPE INTEGER;
