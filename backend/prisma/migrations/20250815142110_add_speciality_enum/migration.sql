/*
  Warnings:

  - Changed the type of `specialty` on the `Doctor` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `specialty` on the `DoctorApplication` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."Speciality" AS ENUM ('GENERAL_DOCTOR', 'PEDIATRICS', 'CARDIOLOGY', 'DERMATOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'OPHTHALMOLOGY', 'ENT', 'GYNECOLOGY', 'UROLOGY', 'GASTROENTEROLOGY', 'ENDOCRINOLOGY', 'ONCOLOGY', 'PSYCHIATRY', 'PULMONOLOGY', 'RHEUMATOLOGY', 'DENTIST', 'PHYSIOTHERAPIST', 'DIET_NUTRITION');

-- Step 1: Add new enum columns (nullable for now)
ALTER TABLE "public"."Doctor" ADD COLUMN "specialty_new" "public"."Speciality";
ALTER TABLE "public"."DoctorApplication" ADD COLUMN "specialty_new" "public"."Speciality";

-- Step 2: Migrate existing data (mapping string to enum)
UPDATE "public"."Doctor" SET "specialty_new" = 'GENERAL_DOCTOR' WHERE lower("specialty") LIKE '%general%';
UPDATE "public"."Doctor" SET "specialty_new" = 'PEDIATRICS' WHERE lower("specialty") LIKE '%child%' OR lower("specialty") LIKE '%pediatr%';
UPDATE "public"."Doctor" SET "specialty_new" = 'CARDIOLOGY' WHERE lower("specialty") LIKE '%heart%' OR lower("specialty") LIKE '%cardio%';
UPDATE "public"."Doctor" SET "specialty_new" = 'DERMATOLOGY' WHERE lower("specialty") LIKE '%skin%' OR lower("specialty") LIKE '%dermat%';
UPDATE "public"."Doctor" SET "specialty_new" = 'NEUROLOGY' WHERE lower("specialty") LIKE '%brain%' OR lower("specialty") LIKE '%neuro%';
UPDATE "public"."Doctor" SET "specialty_new" = 'ORTHOPEDICS' WHERE lower("specialty") LIKE '%bone%' OR lower("specialty") LIKE '%joint%' OR lower("specialty") LIKE '%ortho%';
UPDATE "public"."Doctor" SET "specialty_new" = 'OPHTHALMOLOGY' WHERE lower("specialty") LIKE '%eye%' OR lower("specialty") LIKE '%ophthal%';
UPDATE "public"."Doctor" SET "specialty_new" = 'ENT' WHERE lower("specialty") LIKE '%ent%' OR lower("specialty") LIKE '%ear%' OR lower("specialty") LIKE '%nose%' OR lower("specialty") LIKE '%throat%';
UPDATE "public"."Doctor" SET "specialty_new" = 'GYNECOLOGY' WHERE lower("specialty") LIKE '%women%' OR lower("specialty") LIKE '%gyneco%';
UPDATE "public"."Doctor" SET "specialty_new" = 'UROLOGY' WHERE lower("specialty") LIKE '%urine%' OR lower("specialty") LIKE '%kidney%' OR lower("specialty") LIKE '%uro%';
UPDATE "public"."Doctor" SET "specialty_new" = 'GASTROENTEROLOGY' WHERE lower("specialty") LIKE '%stomach%' OR lower("specialty") LIKE '%gastro%';
UPDATE "public"."Doctor" SET "specialty_new" = 'ENDOCRINOLOGY' WHERE lower("specialty") LIKE '%diabet%' OR lower("specialty") LIKE '%hormone%' OR lower("specialty") LIKE '%endocrin%';
UPDATE "public"."Doctor" SET "specialty_new" = 'ONCOLOGY' WHERE lower("specialty") LIKE '%cancer%' OR lower("specialty") LIKE '%onco%';
UPDATE "public"."Doctor" SET "specialty_new" = 'PSYCHIATRY' WHERE lower("specialty") LIKE '%mental%' OR lower("specialty") LIKE '%psychiat%';
UPDATE "public"."Doctor" SET "specialty_new" = 'PULMONOLOGY' WHERE lower("specialty") LIKE '%lung%' OR lower("specialty") LIKE '%pulmon%';
UPDATE "public"."Doctor" SET "specialty_new" = 'RHEUMATOLOGY' WHERE lower("specialty") LIKE '%arthritis%' OR lower("specialty") LIKE '%rheumat%';
UPDATE "public"."Doctor" SET "specialty_new" = 'DENTIST' WHERE lower("specialty") LIKE '%dentist%' OR lower("specialty") LIKE '%dental%';
UPDATE "public"."Doctor" SET "specialty_new" = 'PHYSIOTHERAPIST' WHERE lower("specialty") LIKE '%physio%';
UPDATE "public"."Doctor" SET "specialty_new" = 'DIET_NUTRITION' WHERE lower("specialty") LIKE '%diet%' OR lower("specialty") LIKE '%nutrition%';

UPDATE "public"."DoctorApplication" SET "specialty_new" = 'GENERAL_DOCTOR' WHERE lower("specialty") LIKE '%general%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'PEDIATRICS' WHERE lower("specialty") LIKE '%child%' OR lower("specialty") LIKE '%pediatr%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'CARDIOLOGY' WHERE lower("specialty") LIKE '%heart%' OR lower("specialty") LIKE '%cardio%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'DERMATOLOGY' WHERE lower("specialty") LIKE '%skin%' OR lower("specialty") LIKE '%dermat%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'NEUROLOGY' WHERE lower("specialty") LIKE '%brain%' OR lower("specialty") LIKE '%neuro%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'ORTHOPEDICS' WHERE lower("specialty") LIKE '%bone%' OR lower("specialty") LIKE '%joint%' OR lower("specialty") LIKE '%ortho%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'OPHTHALMOLOGY' WHERE lower("specialty") LIKE '%eye%' OR lower("specialty") LIKE '%ophthal%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'ENT' WHERE lower("specialty") LIKE '%ent%' OR lower("specialty") LIKE '%ear%' OR lower("specialty") LIKE '%nose%' OR lower("specialty") LIKE '%throat%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'GYNECOLOGY' WHERE lower("specialty") LIKE '%women%' OR lower("specialty") LIKE '%gyneco%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'UROLOGY' WHERE lower("specialty") LIKE '%urine%' OR lower("specialty") LIKE '%kidney%' OR lower("specialty") LIKE '%uro%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'GASTROENTEROLOGY' WHERE lower("specialty") LIKE '%stomach%' OR lower("specialty") LIKE '%gastro%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'ENDOCRINOLOGY' WHERE lower("specialty") LIKE '%diabet%' OR lower("specialty") LIKE '%hormone%' OR lower("specialty") LIKE '%endocrin%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'ONCOLOGY' WHERE lower("specialty") LIKE '%cancer%' OR lower("specialty") LIKE '%onco%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'PSYCHIATRY' WHERE lower("specialty") LIKE '%mental%' OR lower("specialty") LIKE '%psychiat%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'PULMONOLOGY' WHERE lower("specialty") LIKE '%lung%' OR lower("specialty") LIKE '%pulmon%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'RHEUMATOLOGY' WHERE lower("specialty") LIKE '%arthritis%' OR lower("specialty") LIKE '%rheumat%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'DENTIST' WHERE lower("specialty") LIKE '%dentist%' OR lower("specialty") LIKE '%dental%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'PHYSIOTHERAPIST' WHERE lower("specialty") LIKE '%physio%';
UPDATE "public"."DoctorApplication" SET "specialty_new" = 'DIET_NUTRITION' WHERE lower("specialty") LIKE '%diet%' OR lower("specialty") LIKE '%nutrition%';

-- Step 3: Set NOT NULL constraint on new columns
ALTER TABLE "public"."Doctor" ALTER COLUMN "specialty_new" SET NOT NULL;
ALTER TABLE "public"."DoctorApplication" ALTER COLUMN "specialty_new" SET NOT NULL;

-- Step 4: Drop old columns
ALTER TABLE "public"."Doctor" DROP COLUMN "specialty";
ALTER TABLE "public"."DoctorApplication" DROP COLUMN "specialty";

-- Step 5: Rename new columns
ALTER TABLE "public"."Doctor" RENAME COLUMN "specialty_new" TO "specialty";
ALTER TABLE "public"."DoctorApplication" RENAME COLUMN "specialty_new" TO "specialty";
