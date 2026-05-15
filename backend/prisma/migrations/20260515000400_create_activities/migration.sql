CREATE TYPE "ActivityCategory" AS ENUM ('TEACHING', 'DORMITORY', 'RELIGIOUS', 'ADMINISTRATIVE', 'DISCIPLINE');

CREATE TYPE "CompensationType" AS ENUM ('FIXED', 'HOURLY', 'PER_SESSION');

CREATE TABLE "activities" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "activity_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" "ActivityCategory" NOT NULL,
  "start_time" TIME(0) NOT NULL,
  "end_time" TIME(0) NOT NULL,
  "location" TEXT NOT NULL,
  "compensation_type" "CompensationType" NOT NULL,
  "compensation_amount" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "penalty_amount" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "requires_validation" BOOLEAN NOT NULL DEFAULT false,
  "is_recurring" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "activities_activity_code_key" ON "activities"("activity_code");
CREATE INDEX "activities_category_idx" ON "activities"("category");
CREATE INDEX "activities_is_active_idx" ON "activities"("is_active");
CREATE INDEX "activities_deleted_at_idx" ON "activities"("deleted_at");
