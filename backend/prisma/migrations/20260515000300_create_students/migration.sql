CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED', 'DROPPED_OUT');

CREATE TABLE "students" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "student_code" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "gender" "Gender" NOT NULL,
  "birth_place" TEXT NOT NULL,
  "birth_date" DATE NOT NULL,
  "phone_number" TEXT,
  "address" TEXT NOT NULL,
  "class_name" TEXT NOT NULL,
  "academic_year" TEXT NOT NULL,
  "enrollment_date" DATE NOT NULL,
  "dormitory" TEXT NOT NULL,
  "room_number" TEXT NOT NULL,
  "guardian_name" TEXT NOT NULL,
  "guardian_phone" TEXT NOT NULL,
  "student_status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "students_student_code_key" ON "students"("student_code");
CREATE INDEX "students_class_name_idx" ON "students"("class_name");
CREATE INDEX "students_dormitory_idx" ON "students"("dormitory");
CREATE INDEX "students_student_status_idx" ON "students"("student_status");
CREATE INDEX "students_deleted_at_idx" ON "students"("deleted_at");
