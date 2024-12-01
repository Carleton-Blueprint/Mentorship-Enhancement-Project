/*
  Warnings:

  - A unique constraint covering the columns `[course_id,mentor_id]` on the table `MentorCourse` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[course_id,student_id]` on the table `StudentCourse` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MentorCourse_mentor_id_course_id_key";

-- DropIndex
DROP INDEX "StudentCourse_student_id_course_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "MentorCourse_course_id_mentor_id_key" ON "MentorCourse"("course_id", "mentor_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentCourse_course_id_student_id_key" ON "StudentCourse"("course_id", "student_id");
