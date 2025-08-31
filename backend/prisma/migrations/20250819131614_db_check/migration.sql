/*
  Warnings:

  - Made the column `education` on table `Doctor` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `education` to the `DoctorApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Doctor" ALTER COLUMN "education" SET NOT NULL,
ALTER COLUMN "education" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "public"."DoctorApplication" ADD COLUMN     "education" JSONB NOT NULL,
ADD COLUMN     "workExperience" JSONB;
