
import prisma from '../prisma.js';


export const bookingServiceAddBooking = async (patientId, doctorId, dateTime) => {
    console.log("Booking Service Add Booking called with:", { patientId, doctorId, dateTime });

    const booking = await prisma.Booking.create({
        data: {
            patientId,
            doctorId,
            dateTime: new Date(dateTime),
        }
    });
    
    console.log("Booking created:", booking);
    return booking;
}

export const bookingServiceDeleteBooking = async (id) => {
    console.log("Booking Service delete booking called with ID:", id);


        const deletedBooking = await prisma.booking.delete({
            where: { id: Number(id) }
        });

        console.log("Booking deleted:", deletedBooking);
        return deletedBooking;
   
};



export const changeBookingServiceChangeStatus = async (id,status) =>
{
 
    const changedBooking = await prisma.booking.update({
    where: { id: Number(id) },
    data: { status: 'BOOKED' },
    select: { id: true, status: true }
    });
    console.log("Changed Appointment Status to ",changedBooking.status);
    return changedBooking;
    
  

}


export const GetBookedAppointmentService=async( id )=>
{
    const booking = await prisma.booking.findUnique({
        where: { id: Number(id) }
    });
    return booking;
}

export const bookingServiceGetAllBookings = async (Id) => {
    console.log("Booking Service Get All Bookings called");

    const bookings = await prisma.booking.findMany({
        where: { doctorId: Id },
        orderBy: { dateTime: 'asc' },
        include: {
            patient: true,
            doctor: true
        }
    });

    console.log("All bookings fetched:", bookings);
    return bookings;
}
