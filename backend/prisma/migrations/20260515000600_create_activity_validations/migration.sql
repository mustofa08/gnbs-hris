CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "activity_validations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "schedule_id" UUID NOT NULL,
  "employee_id" UUID NOT NULL,
  "activity_id" UUID NOT NULL,
  "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "evidence_url" TEXT,
  "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validated_at" TIMESTAMP(3),
  "validated_by_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "activity_validations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "activity_validations_status_idx" ON "activity_validations"("status");
CREATE INDEX "activity_validations_employee_id_idx" ON "activity_validations"("employee_id");
CREATE INDEX "activity_validations_activity_id_idx" ON "activity_validations"("activity_id");
CREATE INDEX "activity_validations_schedule_id_idx" ON "activity_validations"("schedule_id");
CREATE INDEX "activity_validations_validated_by_id_idx" ON "activity_validations"("validated_by_id");

ALTER TABLE "activity_validations"
  ADD CONSTRAINT "activity_validations_schedule_id_fkey"
  FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "activity_validations"
  ADD CONSTRAINT "activity_validations_employee_id_fkey"
  FOREIGN KEY ("employee_id") REFERENCES "employees"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "activity_validations"
  ADD CONSTRAINT "activity_validations_activity_id_fkey"
  FOREIGN KEY ("activity_id") REFERENCES "activities"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "activity_validations"
  ADD CONSTRAINT "activity_validations_validated_by_id_fkey"
  FOREIGN KEY ("validated_by_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
