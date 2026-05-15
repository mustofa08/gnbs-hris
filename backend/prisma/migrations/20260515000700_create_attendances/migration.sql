CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'EXCUSED');

CREATE TABLE "attendances" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "employee_id" UUID NOT NULL,
  "schedule_id" UUID NOT NULL,
  "activity_id" UUID NOT NULL,
  "attendance_status" "AttendanceStatus" NOT NULL,
  "check_in_time" TIMESTAMP(3) NOT NULL,
  "check_out_time" TIMESTAMP(3),
  "late_minutes" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "attendances_schedule_id_key" ON "attendances"("schedule_id");
CREATE INDEX "attendances_employee_id_idx" ON "attendances"("employee_id");
CREATE INDEX "attendances_activity_id_idx" ON "attendances"("activity_id");
CREATE INDEX "attendances_attendance_status_idx" ON "attendances"("attendance_status");
CREATE INDEX "attendances_check_in_time_idx" ON "attendances"("check_in_time");

ALTER TABLE "attendances"
  ADD CONSTRAINT "attendances_employee_id_fkey"
  FOREIGN KEY ("employee_id") REFERENCES "employees"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "attendances"
  ADD CONSTRAINT "attendances_schedule_id_fkey"
  FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "attendances"
  ADD CONSTRAINT "attendances_activity_id_fkey"
  FOREIGN KEY ("activity_id") REFERENCES "activities"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
