CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PROBATION', 'RESIGNED', 'TERMINATED');

CREATE TYPE "SalaryType" AS ENUM ('MONTHLY', 'DAILY', 'HOURLY');

CREATE TABLE "employees" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "employee_code" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "gender" "Gender" NOT NULL,
  "birth_date" DATE NOT NULL,
  "phone_number" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "position" TEXT NOT NULL,
  "join_date" DATE NOT NULL,
  "employment_status" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
  "salary_type" "SalaryType" NOT NULL,
  "base_salary" DECIMAL(14, 2) NOT NULL,
  "user_id" UUID,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "employees_employee_code_key" ON "employees"("employee_code");
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");
CREATE INDEX "employees_department_idx" ON "employees"("department");
CREATE INDEX "employees_employment_status_idx" ON "employees"("employment_status");
CREATE INDEX "employees_deleted_at_idx" ON "employees"("deleted_at");

ALTER TABLE "employees"
  ADD CONSTRAINT "employees_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
