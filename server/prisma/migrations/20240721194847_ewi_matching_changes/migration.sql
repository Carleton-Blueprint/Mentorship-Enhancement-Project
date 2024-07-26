/*
  Warnings:

  - You are about to drop the column `Program` on the `Mentor` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Mentor` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `Mentor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Mentor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `program` to the `Mentor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mentor" DROP COLUMN "Program",
DROP COLUMN "name",
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "program" TEXT NOT NULL;
