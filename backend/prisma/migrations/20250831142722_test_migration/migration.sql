-- AlterTable
ALTER TABLE "public"."Clinic" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Doctor" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
