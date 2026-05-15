CREATE TYPE "RecurrenceType" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');

CREATE TABLE "schedules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "employee_id" UUID NOT NULL,
  "activity_id" UUID NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "start_time" TIME(0) NOT NULL,
  "end_time" TIME(0) NOT NULL,
  "recurrence_type" "RecurrenceType" NOT NULL DEFAULT 'NONE',
  "recurrence_days" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "location" TEXT NOT NULL,
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "schedules_employee_id_idx" ON "schedules"("employee_id");
CREATE INDEX "schedules_activity_id_idx" ON "schedules"("activity_id");
CREATE INDEX "schedules_is_active_idx" ON "schedules"("is_active");
CREATE INDEX "schedules_deleted_at_idx" ON "schedules"("deleted_at");

ALTER TABLE "schedules"
  ADD CONSTRAINT "schedules_employee_id_fkey"
  FOREIGN KEY ("employee_id") REFERENCES "employees"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "schedules"
  ADD CONSTRAINT "schedules_activity_id_fkey"
  FOREIGN KEY ("activity_id") REFERENCES "activities"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
