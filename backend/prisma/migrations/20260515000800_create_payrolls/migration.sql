CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'GENERATED', 'PAID');

CREATE TABLE "payrolls" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "employee_id" UUID NOT NULL,
  "payroll_period" TEXT NOT NULL,
  "payroll_status" "PayrollStatus" NOT NULL DEFAULT 'GENERATED',
  "total_activities" INTEGER NOT NULL DEFAULT 0,
  "total_attendance" INTEGER NOT NULL DEFAULT 0,
  "total_compensation" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "total_penalty" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "total_late_penalty" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "final_amount" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paid_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payrolls_employee_id_payroll_period_key" ON "payrolls"("employee_id", "payroll_period");
CREATE INDEX "payrolls_employee_id_idx" ON "payrolls"("employee_id");
CREATE INDEX "payrolls_payroll_period_idx" ON "payrolls"("payroll_period");
CREATE INDEX "payrolls_payroll_status_idx" ON "payrolls"("payroll_status");

ALTER TABLE "payrolls"
  ADD CONSTRAINT "payrolls_employee_id_fkey"
  FOREIGN KEY ("employee_id") REFERENCES "employees"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
