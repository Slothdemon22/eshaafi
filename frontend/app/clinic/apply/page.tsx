'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Mail, Phone, MapPin, Globe, ArrowLeft, Heart } from 'lucide-react';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';
import { useToast } from '@/components/ui/Toaster';

const clinicSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  addressLine1: z.string().min(2, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  zip: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
});

type ClinicForm = z.infer<typeof clinicSchema>;

const ClinicApplyPage: React.FC = () => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClinicForm>({
    resolver: zodResolver(clinicSchema),
  });

  const onSubmit = async (data: ClinicForm) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(buildApiUrl(API_ENDPOINTS.clinicApply), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit application');
      addToast({ type: 'success', title: 'Application Submitted', message: 'We will contact you soon.' });
      reset();
    } catch (e: any) {
      addToast({ type: 'error', title: 'Submission Failed', message: e.message || 'Try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center space-x-2 text-[#0E6BA8] hover:text-[#0B5A8A] mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elevated">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#1F2937] mb-2 heading-font">Join as a Clinic</h1>
          <p className="text-[#4B5563]">Provide your clinic details to get onboarded.</p>
        </motion.div>

        <motion.form onSubmit={handleSubmit(onSubmit)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-hover p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Clinic Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input {...register('name')} className="input-field pl-12" placeholder="Clinic Name" />
              </div>
              {errors.name && <p className="mt-2 text-sm text-[#DC2626]">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input {...register('email')} className="input-field pl-12" placeholder="email@clinic.com" />
              </div>
              {errors.email && <p className="mt-2 text-sm text-[#DC2626]">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input {...register('phone')} className="input-field pl-12" placeholder="+1 555 000 111" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Website</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input {...register('website')} className="input-field pl-12" placeholder="https://" />
              </div>
              {errors.website && <p className="mt-2 text-sm text-[#DC2626]">{errors.website.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Address Line 1</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input {...register('addressLine1')} className="input-field pl-12" placeholder="Street address" />
              </div>
              {errors.addressLine1 && <p className="mt-2 text-sm text-[#DC2626]">{errors.addressLine1.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Address Line 2</label>
              <input {...register('addressLine2')} className="input-field" placeholder="Apartment, suite, etc." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">City</label>
              <input {...register('city')} className="input-field" placeholder="City" />
              {errors.city && <p className="mt-2 text-sm text-[#DC2626]">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">State</label>
              <input {...register('state')} className="input-field" placeholder="State" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">Country</label>
              <input {...register('country')} className="input-field" placeholder="Country" />
              {errors.country && <p className="mt-2 text-sm text-[#DC2626]">{errors.country.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">ZIP</label>
              <input {...register('zip')} className="input-field" placeholder="ZIP" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#1F2937] mb-3">About Clinic</label>
              <textarea {...register('description')} className="input-field min-h-28" placeholder="Describe your clinic"></textarea>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} type="submit" className="btn-primary w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
};

export default ClinicApplyPage;


