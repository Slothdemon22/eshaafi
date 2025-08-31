-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'CLINIC_ADMIN';

-- CreateTable
CREATE TABLE "public"."ClinicApplication" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "zip" TEXT,
    "website" TEXT,
    "description" TEXT,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "generatedPassword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Clinic" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "zip" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClinicAdmin" (
    "id" SERIAL NOT NULL,
    "clinicId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ClinicAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_email_key" ON "public"."Clinic"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicAdmin_userId_key" ON "public"."ClinicAdmin"("userId");

-- AddForeignKey
ALTER TABLE "public"."ClinicAdmin" ADD CONSTRAINT "ClinicAdmin_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "public"."Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClinicAdmin" ADD CONSTRAINT "ClinicAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
