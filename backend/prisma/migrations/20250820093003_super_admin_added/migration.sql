-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "public"."Doctor" ADD COLUMN     "clinicId" INTEGER;

-- AlterTable
ALTER TABLE "public"."DoctorApplication" ADD COLUMN     "clinicId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Doctor" ADD CONSTRAINT "Doctor_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "public"."Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorApplication" ADD CONSTRAINT "DoctorApplication_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "public"."Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
