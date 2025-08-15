'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  MessageSquare, 
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import Link from 'next/link';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config';

interface Doctor {
  id: number;
  name: string;
  email: string;
  specialty: string;
  experience?: number;
  location?: string;
  availability?: any;
}

interface AvailabilitySlot {
  id: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Please select a doctor'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)'),
  symptoms: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const BookAppointmentPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  const selectedDate = watch('date');
  const selectedTime = watch('time');

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.allDoctors), {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setDoctors(data.doctors || []);
        } else {
          addToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to load doctors'
          });
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load doctors'
        });
      }
    };

    if (isAuthenticated) {
    fetchDoctors();
    }
  }, [isAuthenticated, addToast]);

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDoctor || !selectedDate) {
        setAvailableSlots([]);
        return;
      }

      try {
        setIsLoadingSlots(true);
        console.log('Fetching slots for doctor:', selectedDoctor.id, 'date:', selectedDate);
        const response = await fetch(
          buildApiUrl(API_ENDPOINTS.doctorAvailabilityBookings(selectedDoctor.id.toString(), selectedDate)),
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Available slots:', data.availability);
          setAvailableSlots(data.availability || []);
        } else {
          console.error('Failed to fetch slots:', response.status);
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Error fetching available slots:', error);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDoctor, selectedDate]);

  const handleDoctorSelect = (doctor: Doctor) => {
    console.log('Doctor selected:', doctor);
    setSelectedDoctor(doctor);
    setValue('doctorId', doctor.id.toString());
    setValue('time', ''); // Reset time when doctor changes
    setAvailableSlots([]); // Reset available slots
  };

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    console.log('Slot selected:', slot);
    if (!slot.isBooked) {
      setValue('time', slot.startTime);
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      setIsLoading(true);
      
      const bookingData = {
        doctorId: parseInt(data.doctorId),
        dateTime: `${data.date}T${data.time}:00`,
        reason: data.reason,
        symptoms: data.symptoms || ''
      };
      
      console.log('Submitting booking data:', bookingData);
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.bookAppointment), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
      addToast({
        type: 'success',
        title: 'Appointment Booked!',
        message: 'Your appointment has been successfully booked. You will receive a confirmation shortly.',
      });
      router.push('/appointments');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      addToast({
        type: 'error',
        title: 'Booking Failed',
        message: error.message || 'Failed to book appointment. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elevated">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#1F2937] mb-4 heading-font">Authentication Required</h2>
          <p className="text-[#4B5563] mb-8 text-lg">Please log in to book an appointment.</p>
          <Link href="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center space-x-2 text-[#0E6BA8] hover:text-[#0B5A8A] mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-4 heading-font">
              Book an Appointment
            </h1>
            <p className="text-xl text-[#4B5563]">
              Schedule your healthcare appointment with our expert doctors
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-hover"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Doctor Selection */}
            <div>
              <label className="block text-lg font-semibold text-[#1F2937] mb-4">
                <User className="inline w-5 h-5 mr-2" />
                Select a Doctor
              </label>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doctor) => (
                  <motion.div
                    key={doctor.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDoctorSelect(doctor)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedDoctor?.id === doctor.id
                        ? 'border-[#0E6BA8] bg-[#F0F9FF] shadow-elevated'
                        : 'border-gray-200 hover:border-[#0E6BA8]/50 hover:shadow-professional'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1F2937]">{doctor.name}</h3>
                        <p className="text-sm text-[#4B5563]">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="text-sm text-[#4B5563]">
                      <p>Experience: {doctor.experience} years</p>
                      <p>{doctor.email}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              {errors.doctorId && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-[#DC2626]"
                >
                  {errors.doctorId.message}
                </motion.p>
              )}
            </div>

            {/* Date and Time Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-lg font-semibold text-[#1F2937] mb-4">
                  <Calendar className="inline w-5 h-5 mr-2" />
                  Select Date
                </label>
                <input
                  {...register('date')}
                  type="date"
                  id="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
                {errors.date && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-[#DC2626]"
                  >
                    {errors.date.message}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-lg font-semibold text-[#1F2937] mb-4">
                  <Clock className="inline w-5 h-5 mr-2" />
                  Select Time
                </label>
                {isLoadingSlots ? (
                  <div className="flex items-center justify-center p-4 border border-gray-200 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-[#0E6BA8] mr-2" />
                    <span className="text-[#4B5563]">Loading available slots...</span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <motion.button
                        key={slot.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={slot.isBooked}
                        className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          slot.isBooked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : selectedTime === slot.startTime
                            ? 'bg-[#0E6BA8] text-white shadow-elevated'
                            : 'bg-white border border-gray-200 text-[#1F2937] hover:border-[#0E6BA8] hover:shadow-professional'
                        }`}
                      >
                        {slot.startTime}
                      </motion.button>
                    ))}
                  </div>
                ) : selectedDoctor && selectedDate ? (
                  <div className="p-4 border border-gray-200 rounded-lg text-center">
                    <p className="text-[#4B5563]">No available slots for this date</p>
                  </div>
                ) : (
                  <div className="p-4 border border-gray-200 rounded-lg text-center">
                    <p className="text-[#4B5563]">Select a doctor and date to see available times</p>
                  </div>
                )}
                {errors.time && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-[#DC2626]"
                  >
                    {errors.time.message}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Reason and Symptoms */}
            <div className="space-y-6">
              <div>
                <label htmlFor="reason" className="block text-lg font-semibold text-[#1F2937] mb-4">
                  <MessageSquare className="inline w-5 h-5 mr-2" />
                  Reason for Visit
                </label>
                <textarea
                  {...register('reason')}
                  id="reason"
                  rows={4}
                  placeholder="Please describe the reason for your visit in detail..."
                  className="input-field resize-none"
                />
                {errors.reason && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-[#DC2626]"
                  >
                    {errors.reason.message}
                  </motion.p>
                )}
              </div>

              <div>
                <label htmlFor="symptoms" className="block text-lg font-semibold text-[#1F2937] mb-4">
                  <AlertCircle className="inline w-5 h-5 mr-2" />
                  Symptoms (Optional)
                </label>
                <textarea
                  {...register('symptoms')}
                  id="symptoms"
                  rows={3}
                  placeholder="Describe any symptoms you're experiencing..."
                  className="input-field resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Booking Appointment...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Book Appointment</span>
                </div>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BookAppointmentPage;
