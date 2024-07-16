-- CreateTable
CREATE TABLE "Class" (
    "course_id" SERIAL NOT NULL,
    "course_code" TEXT NOT NULL,
    "course_name" TEXT NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "Mentor" (
    "mentor_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "Program" TEXT NOT NULL,

    CONSTRAINT "Mentor_pkey" PRIMARY KEY ("mentor_id")
);

-- CreateTable
CREATE TABLE "MentorAvailability" (
    "id" SERIAL NOT NULL,
    "mentor_id" INTEGER NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "student_id" SERIAL NOT NULL,
    "student_number" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "StudentAvailability" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Class_course_code_key" ON "Class"("course_code");

-- CreateIndex
CREATE UNIQUE INDEX "MentorAvailability_mentor_id_key" ON "MentorAvailability"("mentor_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_student_number_key" ON "Student"("student_number");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAvailability_student_id_key" ON "StudentAvailability"("student_id");
