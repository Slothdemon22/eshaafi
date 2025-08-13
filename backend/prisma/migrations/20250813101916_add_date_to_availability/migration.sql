/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `AvailabilitySlot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[doctorId,date,startTime,endTime]` on the `AvailabilitySlot` table will be added. If there are existing duplicate values, this will fail.
*/

-- First, add the new columns as nullable
ALTER TABLE "public"."AvailabilitySlot" 
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "date" TIMESTAMP(3),
ADD COLUMN "duration" INTEGER,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have proper values
UPDATE "public"."AvailabilitySlot" 
SET 
  "date" = CURRENT_TIMESTAMP,
  "duration" = 30;

-- Now drop the old column
ALTER TABLE "public"."AvailabilitySlot" DROP COLUMN "dayOfWeek";

-- Change data types for startTime and endTime - convert timestamp to text
ALTER TABLE "public"."AvailabilitySlot" 
ALTER COLUMN "startTime" TYPE TEXT USING "startTime"::text,
ALTER COLUMN "endTime" TYPE TEXT USING "endTime"::text;

-- Remove duplicate records before creating unique index
DELETE FROM "public"."AvailabilitySlot" a
WHERE a.id NOT IN (
  SELECT MIN(b.id)
  FROM "public"."AvailabilitySlot" b
  GROUP BY b."doctorId", b."date", b."startTime", b."endTime"
);

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilitySlot_doctorId_date_startTime_endTime_key" ON "public"."AvailabilitySlot"("doctorId", "date", "startTime", "endTime");
