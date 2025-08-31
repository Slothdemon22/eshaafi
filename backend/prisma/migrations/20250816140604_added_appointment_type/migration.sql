-- CreateEnum
CREATE TYPE "public"."AppointmentType" AS ENUM ('VIRTUAL', 'PHYSICAL');

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "type" "public"."AppointmentType" NOT NULL DEFAULT 'PHYSICAL';
