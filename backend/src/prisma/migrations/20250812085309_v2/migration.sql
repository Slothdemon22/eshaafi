-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'BOOKED', 'REJECTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING';
