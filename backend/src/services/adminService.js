import prisma  from '../prisma.js';
import bcrypt from 'bcrypt';

export const adminServiceCreateDoctorFromApplication = async (applicationId) => {
    const application = await prisma.doctorApplication.findUnique({ where: { id: Number(applicationId) } });
    if (!application) throw new Error('Application not found');
    if (application.status !== 'PENDING') throw new Error('Application already processed');

    const plainPassword = application.generatedPassword || Math.random().toString(36).slice(-10);
    const user = await prisma.user.create({
        data: {
            name: application.name,
            email: application.email,
            password: await bcrypt.hash(plainPassword, 10),
            role: 'DOCTOR'
        }
    });
    await prisma.doctor.create({
        data: {
            location: application.location,
            userId: user.id,
            specialty: application.specialty,
            clinicId: application.clinicId || null
        }
    });
    await prisma.doctorApplication.update({
        where: { id: application.id },
        data: { status: 'APPROVED', generatedPassword: plainPassword }
    });
    return { user, plainPassword };
}



export const adminServiceGetDoctors = async () => {
    console.log("Admin Service Get Doctors called");
    
    const doctors = await prisma.doctor.findMany({
        include: {
            user: true // Include user details
        }
    });
    console.log("Doctors fetched:", doctors);
    
    return doctors;
}

export const adminServiceGetDoctorApplications = async () => {
    const applications = await prisma.doctorApplication.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return applications;
}

export const adminServiceSubmitDoctorApplication = async (payload) => {
    const existing = await prisma.doctorApplication.findFirst({ where: { email: payload.email, status: 'PENDING' } });
    if (existing) throw new Error('Application already submitted');
    const app = await prisma.doctorApplication.create({ data: payload });
    return app;
}

export const adminServiceRejectDoctorApplication = async (id) => {
    const app = await prisma.doctorApplication.update({ where: { id: Number(id) }, data: { status: 'REJECTED' } });
    return app;
}

// Clinic management services

export const adminServiceGetClinicApplications = async () => {
    const applications = await prisma.clinicApplication.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return applications;
}

export const adminServiceSubmitClinicApplication = async (payload) => {
    const existing = await prisma.clinicApplication.findFirst({ where: { email: payload.email, status: 'PENDING' } });
    if (existing) throw new Error('Application already submitted');
    const app = await prisma.clinicApplication.create({ data: payload });
    return app;
}

export const adminServiceRejectClinicApplication = async (id) => {
    const app = await prisma.clinicApplication.update({ where: { id: Number(id) }, data: { status: 'REJECTED' } });
    return app;
}

export const adminServiceApproveClinicApplication = async (applicationId) => {
    const application = await prisma.clinicApplication.findUnique({ where: { id: Number(applicationId) } });
    if (!application) throw new Error('Application not found');
    if (application.status !== 'PENDING') throw new Error('Application already processed');

    // Create clinic
    const clinic = await prisma.clinic.create({
        data: {
            name: application.name,
            email: application.email,
            phone: application.phone || null,
            addressLine1: application.addressLine1,
            addressLine2: application.addressLine2 || null,
            city: application.city,
            state: application.state || null,
            country: application.country,
            zip: application.zip || null,
            website: application.website || null,
            description: application.description || null
        }
    });

    // Generate random admin email and password
    const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 20) || 'clinic';
    const randomString = (len = 6) => Math.random().toString(36).replace(/[^a-z0-9]/gi, '').slice(-len);
    const base = slugify(application.name);
    let generatedEmail = `${base}-${randomString(5)}@eshafi.app`;
    // Ensure unique email
    for (let i = 0; i < 5; i++) {
        const exists = await prisma.user.findUnique({ where: { email: generatedEmail } });
        if (!exists) break;
        generatedEmail = `${base}-${randomString(7)}@eshafi.app`;
    }
    const plainPassword = application.generatedPassword || randomString(12);
    const user = await prisma.user.create({
        data: {
            name: `${application.name} Admin`,
            email: generatedEmail,
            password: await bcrypt.hash(plainPassword, 10),
            role: 'CLINIC_ADMIN'
        }
    });

    await prisma.clinicAdmin.create({
        data: {
            clinicId: clinic.id,
            userId: user.id
        }
    });

    await prisma.clinicApplication.update({
        where: { id: application.id },
        data: { status: 'APPROVED', generatedPassword: plainPassword }
    });

    return { clinic, user, plainPassword, generatedEmail };
}

export const adminServiceGetClinics = async () => {
    const clinics = await prisma.clinic.findMany({
        include: {
            admins: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
            _count: { select: { admins: true } },
            // Doctors associated to this clinic
            // Keep payload lean: include doctor id and user info
            // Full details can be fetched via detail API
            // @ts-ignore
            doctors: { include: { user: { select: { id: true, name: true, email: true } } } }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Add generated passwords to clinic admins
    for (const clinic of clinics) {
        if (clinic.admins && clinic.admins.length > 0) {
            // Get the clinic application to retrieve generated passwords
            const clinicApplication = await prisma.clinicApplication.findFirst({
                where: { 
                    name: clinic.name,
                    status: 'APPROVED'
                },
                orderBy: { createdAt: 'desc' }
            });

            if (clinicApplication && clinicApplication.generatedPassword) {
                clinic.admins = clinic.admins.map(admin => ({
                    ...admin,
                    generatedPassword: clinicApplication.generatedPassword
                }));
            }
        }
    }

    return clinics;
}

export const adminServiceCreateClinicAdmin = async (clinicId, { name, email, password }) => {
    // Optional password, if not provided, generate one
    const plainPassword = password || Math.random().toString(36).slice(-10);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: await bcrypt.hash(plainPassword, 10),
            role: 'CLINIC_ADMIN'
        }
    });
    const link = await prisma.clinicAdmin.create({
        data: {
            clinicId: Number(clinicId),
            userId: user.id
        }
    });
    return { user, clinicAdmin: link, plainPassword };
}

export const adminServiceDeleteClinic = async (clinicId) => {
    const id = Number(clinicId);
    // Ensure clinic exists
    const clinic = await prisma.clinic.findUnique({ where: { id } });
    if (!clinic) throw new Error('Clinic not found');
    // Disassociate doctors
    await prisma.doctor.updateMany({ where: { clinicId: id }, data: { clinicId: null } });
    // Remove clinic admins
    await prisma.clinicAdmin.deleteMany({ where: { clinicId: id } });
    // Delete clinic
    await prisma.clinic.delete({ where: { id } });
    return { success: true };
}

export const adminServiceGetClinicDetails = async (clinicId) => {
    const id = Number(clinicId);
    const clinic = await prisma.clinic.findUnique({
        where: { id },
        include: {
            admins: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
            doctors: { include: { user: { select: { id: true, name: true, email: true } } } }
        }
    });
    if (!clinic) throw new Error('Clinic not found');
    
    // Get the clinic application to retrieve generated passwords
    const clinicApplication = await prisma.clinicApplication.findFirst({
        where: { 
            name: clinic.name,
            status: 'APPROVED'
        },
        orderBy: { createdAt: 'desc' }
    });
    
    // Add review data for each doctor
    if (clinic.doctors && clinic.doctors.length > 0) {
        const doctorIds = clinic.doctors.map(d => d.id);
        const reviews = await prisma.review.findMany({
            where: { doctorId: { in: doctorIds } }
        });
        
        // Calculate review stats for each doctor
        const reviewStats = new Map();
        for (const review of reviews) {
            if (!reviewStats.has(review.doctorId)) {
                reviewStats.set(review.doctorId, { count: 0, totalRating: 0 });
            }
            const stats = reviewStats.get(review.doctorId);
            stats.count += 1;
            stats.totalRating += (review.behaviourRating + review.recommendationRating) / 2;
        }
        
        // Add review data to doctors
        clinic.doctors = clinic.doctors.map(doctor => {
            const stats = reviewStats.get(doctor.id);
            return {
                ...doctor,
                reviewCount: stats ? stats.count : 0,
                averageRating: stats && stats.count > 0 ? stats.totalRating / stats.count : 0
            };
        });
    }
    
    // Add generated password to clinic admins if available
    if (clinic.admins && clinic.admins.length > 0 && clinicApplication && clinicApplication.generatedPassword) {
        clinic.admins = clinic.admins.map(admin => ({
            ...admin,
            generatedPassword: clinicApplication.generatedPassword
        }));
    }
    
    return clinic;
}
