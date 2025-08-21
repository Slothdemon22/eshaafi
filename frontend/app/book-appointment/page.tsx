'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
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
  online?: boolean;
  clinic?: { id: number; name: string; active?: boolean } | null;
}

interface AvailabilitySlot {
  id: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  location?: string;
  duration?: number; // Add duration for filtering
  custom?: boolean; // Add custom flag
}

const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Please select a doctor'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)'),
  symptoms: z.string().optional(),
  type: z.enum(['PHYSICAL', 'VIRTUAL']),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const BookAppointmentPage: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotDurationFilter, setSlotDurationFilter] = useState<'all' | 'half' | 'full'>('all');
  const [slotTypeFilter, setSlotTypeFilter] = useState<'all' | 'custom' | 'half' | 'full'>('all');
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { type: 'PHYSICAL' },
  });

  const selectedDate = watch('date');
  const selectedTime = watch('time');
  const selectedType = watch('type');

  // Fetch doctor from query param and preselect
  useEffect(() => {
    const doctorId = searchParams?.get('doctorId');
    const fetchDoctor = async (id: string) => {
      try {
        const res = await fetch(buildApiUrl(API_ENDPOINTS.getDoctorById(id)));
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Failed to load doctor');
        const doc: Doctor = {
          id: body.id,
          name: body.name,
          email: body.email,
          specialty: body.specialty,
          location: body.location,
          clinic: body.clinic || null,
          online: undefined,
        };
        setSelectedDoctor(doc);
        setValue('doctorId', String(doc.id));
      } catch (e: any) {
        addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to load doctor' });
      }
    };
    if (doctorId) fetchDoctor(doctorId);
  }, [searchParams, addToast, setValue]);

  // Poll online status for the selected doctor
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    const fetchStatus = async () => {
      if (!selectedDoctor) return;
      try {
        const res = await fetch(buildApiUrl(`/api/doctor/status/${selectedDoctor.id}`));
        if (res.ok) {
          const data = await res.json();
          setSelectedDoctor(prev => prev ? { ...prev, online: data.online } : prev);
        }
      } catch {}
    };
    fetchStatus();
    interval = setInterval(fetchStatus, 5000);
    return () => { if (interval) clearInterval(interval); };
  }, [selectedDoctor?.id]);

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

  // No manual doctor selection; selection comes from clinics/doctors pages

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
        symptoms: data.symptoms || '',
        type: data.type,
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
            {/* Selected Doctor Summary */}
            <div>
              <label className="block text-lg font-semibold text-[#1F2937] mb-4">
                <User className="inline w-5 h-5 mr-2" />
                Selected Doctor
              </label>
              {selectedDoctor ? (
                <div className="p-4 rounded-xl border-2 bg-[#F9FAFB]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#1F2937]">{selectedDoctor.name}</div>
                        <div className="text-sm text-[#4B5563]">{selectedDoctor.email}</div>
                        {selectedDoctor.clinic && (
                          <div className="text-xs text-[#0E6BA8] mt-1">Clinic: {selectedDoctor.clinic.name}</div>
                        )}
                        {typeof selectedDoctor.online === 'boolean' && (
                          <div className={`text-xs mt-1 ${selectedDoctor.online ? 'text-green-600' : 'text-red-600'}`}>{selectedDoctor.online ? 'Online' : 'Offline'}</div>
                        )}
                      </div>
                    </div>
                    <Link href={`/doctors/${selectedDoctor.id}`} className="btn-secondary">View Profile</Link>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border-2 text-sm text-[#4B5563]">
                  Please select a doctor from the <Link href="/doctors" className="text-[#0E6BA8] underline">Doctors</Link> or <Link href="/clinics" className="text-[#0E6BA8] underline">Clinics</Link> pages.
                </div>
              )}
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
                {/* Slot Type Filter */}
                <div className="mb-4">
                  <select
                    value={slotTypeFilter}
                    onChange={e => setSlotTypeFilter(e.target.value as any)}
                    className="input-field w-auto"
                  >
                    <option value="all">All Durations</option>
                    <option value="custom">Custom</option>
                    <option value="half">Half Hour</option>
                    <option value="full">Full Hour</option>
                  </select>
                </div>
                {isLoadingSlots ? (
                  <div className="flex items-center justify-center p-4 border border-gray-200 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-[#0E6BA8] mr-2" />
                    <span className="text-[#4B5563]">Loading available slots...</span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots
                      .filter(slot =>
                        slotTypeFilter === 'all' ? true :
                        slotTypeFilter === 'custom' ? slot.custom :
                        slotTypeFilter === 'half' ? slot.duration === 30 && !slot.custom :
                        slotTypeFilter === 'full' ? slot.duration === 60 && !slot.custom : true
                      )
                      .map((slot) => (
                        <motion.button
                          key={slot.id}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSlotSelect(slot)}
                          disabled={slot.isBooked}
                          className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${slot.isBooked
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : selectedTime === slot.startTime
                                ? 'bg-[#0E6BA8] text-white shadow-elevated'
                                : 'bg-white border border-gray-200 text-[#1F2937] hover:border-[#0E6BA8] hover:shadow-professional'
                            }`}
                        >
                          <div>
                            {new Date(`1970-01-01T${slot.startTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            {slot.custom && <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">Custom</span>}
                          </div>
                          {slot.location && (
                            <div className="text-xs mt-1 text-[#1CA7A6] font-medium truncate" title={slot.location}>
                              {slot.location}
                            </div>
                          )}
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

            {/* Appointment Type Selection */}
            <div>
              <label className="block text-lg font-semibold text-[#1F2937] mb-4">
                Appointment Type
              </label>
              <div className="flex gap-6 mb-2">
                <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-all duration-200 ${selectedType === 'PHYSICAL' ? 'border-[#0E6BA8] bg-[#F0F9FF]' : 'border-gray-200 hover:border-[#0E6BA8]/50'}`}>
                  <input
                    type="radio"
                    value="PHYSICAL"
                    {...register('type')}
                    checked={selectedType === 'PHYSICAL'}
                    className="form-radio accent-[#0E6BA8]"
                  />
                  <span className="font-medium text-[#1F2937]">Physical</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-all duration-200 ${selectedType === 'VIRTUAL' ? 'border-[#1CA7A6] bg-[#E0F2FE]' : 'border-gray-200 hover:border-[#1CA7A6]/50'}`}>
                  <input
                    type="radio"
                    value="VIRTUAL"
                    {...register('type')}
                    checked={selectedType === 'VIRTUAL'}
                    className="form-radio accent-[#1CA7A6]"
                  />
                  <span className="font-medium text-[#1F2937]">Virtual</span>
                </label>
              </div>
              <p className="text-xs text-[#4B5563]">Choose whether you want to visit the doctor in person or have a virtual (online) appointment.</p>
              {errors.type && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-[#DC2626]"
                >
                  {errors.type.message}
                </motion.p>
              )}
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

