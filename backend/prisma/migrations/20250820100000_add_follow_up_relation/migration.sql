-- Add follow-up relation to Booking
ALTER TABLE "public"."Booking"
ADD COLUMN "followUpOfId" INTEGER;

ALTER TABLE "public"."Booking"
ADD CONSTRAINT "Booking_followUpOfId_fkey"
FOREIGN KEY ("followUpOfId")
REFERENCES "public"."Booking"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;



