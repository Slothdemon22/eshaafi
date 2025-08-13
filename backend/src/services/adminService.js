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
            specialty: application.specialty
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
