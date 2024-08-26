/*
  Warnings:

  - You are about to drop the column `entity_number` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[student_id]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `student_id` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Student_entity_number_key";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "entity_number",
ADD COLUMN     "student_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_student_id_key" ON "Student"("student_id");
