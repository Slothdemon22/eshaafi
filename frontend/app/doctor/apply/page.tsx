"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Stethoscope, BookText, User } from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config';

const applicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  specialty: z.string().min(2, 'Specialty is required'),
  experienceYears: z.string().min(1, 'Experience is required'),
  credentials: z.string().optional(),
});

type ApplicationData = z.infer<typeof applicationSchema>;

const DoctorApplyPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [specialities, setSpecialities] = useState<{ value: string, label: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    fetch(buildApiUrl(API_ENDPOINTS.doctorSpecialities))
      .then(res => res.json())
      .then(setSpecialities);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      // Convert experienceYears to a number
      const payload = { ...data, experienceYears: data.experienceYears ? Number(data.experienceYears) : undefined };
      const res = await fetch(buildApiUrl(API_ENDPOINTS.doctorApply), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to submit');
      setSuccess('Application submitted successfully. You will be notified upon approval.');
    } catch (e: any) {
      setError(e.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-[#0E6BA8] hover:text-[#0B5A8A] mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-3 heading-font">Doctor Application</h1>
          <p className="text-[#4B5563] text-lg">Fill the form below to apply as a doctor. An admin will review your application.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-hover">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {success && <div className="p-4 bg-[#ECFDF5] border border-[#16A34A]/20 text-[#065F46] rounded-lg">{success}</div>}
            {error && <div className="p-4 bg-[#FEF2F2] border border-[#DC2626]/20 text-[#991B1B] rounded-lg">{error}</div>}

            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input {...register('name')} className="input-field pl-12" placeholder="Enter your full name" />
              </div>
              {errors.name && <p className="mt-2 text-sm text-[#DC2626]">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input {...register('email')} className="input-field pl-12" placeholder="Enter your email" />
              </div>
              {errors.email && <p className="mt-2 text-sm text-[#DC2626]">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input {...register('phone')} className="input-field pl-12" placeholder="Enter your phone (optional)" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input {...register('location')} className="input-field pl-12" placeholder="City, Country" />
              </div>
              {errors.location && <p className="mt-2 text-sm text-[#DC2626]">{errors.location.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Specialty</label>
              <div className="relative">
                <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  type="text"
                  className="input-field pl-12"
                  placeholder="Type or select specialty..."
                  value={specialtySearch}
                  autoComplete="off"
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                  onChange={e => {
                    setSpecialtySearch(e.target.value);
                    setShowDropdown(true);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={e => {
                    const filtered = specialities.filter(s => s.label.toLowerCase().includes(specialtySearch.toLowerCase()));
                    if (e.key === 'ArrowDown') {
                      setHighlightedIndex(i => Math.min(i + 1, filtered.length - 1));
                    } else if (e.key === 'ArrowUp') {
                      setHighlightedIndex(i => Math.max(i - 1, 0));
                    } else if (e.key === 'Enter' && filtered[highlightedIndex]) {
                      setSpecialtySearch(filtered[highlightedIndex].label);
                      setValue('specialty', filtered[highlightedIndex].value);
                      setShowDropdown(false);
                    }
                  }}
                />
                {showDropdown && (
                  <ul className="absolute z-10 left-0 right-0 bg-white border border-[#0E6BA8] rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1 text-base">
                    {(specialtySearch.trim() === '' ? specialities : specialities.filter(s => s.label.toLowerCase().includes(specialtySearch.toLowerCase()))).map((s, idx) => (
                      <li
                        key={s.value}
                        className={`px-4 py-2 cursor-pointer text-[#1F2937] hover:bg-[#F0F9FF] ${idx === highlightedIndex ? 'bg-[#E0F2FE] font-semibold' : ''}`}
                        onMouseDown={() => {
                          setSpecialtySearch(s.label);
                          setValue('specialty', s.value);
                          setShowDropdown(false);
                        }}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                      >
                        {s.label}
                      </li>
                    ))}
                    {(specialtySearch.trim() !== '' && specialities.filter(s => s.label.toLowerCase().includes(specialtySearch.toLowerCase())).length === 0) && (
                      <li className="px-4 py-2 text-[#9CA3AF]">No results</li>
                    )}
                  </ul>
                )}
                <input type="hidden" {...register('specialty')} />
              </div>
              {errors.specialty && <p className="mt-2 text-sm text-[#DC2626]">{errors.specialty.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Experience (years)</label>
              <input {...register('experienceYears')} className="input-field" placeholder="e.g., 8" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Credentials</label>
              <div className="relative">
                <BookText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <textarea {...register('credentials')} className="input-field pl-12 resize-none" placeholder="Degrees, certifications, etc." rows={3} />
              </div>
            </div>

            <motion.button 
              type="submit" 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              disabled={isSubmitting} 
              className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorApplyPage;


