'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';
import { useToast } from '@/components/ui/Toaster';
import { useParams } from 'next/navigation';
import DoctorApplicationForm from '@/components/DoctorApplicationForm';

interface Clinic {
  id: number;
  name: string;
  email: string;
  city: string;
  country: string;
}

const ClinicDoctorApplyPage: React.FC = () => {
  const { clinicId } = useParams();
  const { addToast } = useToast();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const res = await fetch(buildApiUrl(API_ENDPOINTS.getClinicById(clinicId as string)));
        if (!res.ok) throw new Error('Clinic not found');
        const data = await res.json();
        setClinic(data.clinic);
      } catch (e: any) {
        addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to load clinic' });
      } finally {
        setLoading(false);
      }
    };
    fetchClinic();
  }, [clinicId, addToast]);


  if (loading) {
    return (
      <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-[#4B5563]">Loading clinic information...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">Clinic Not Found</h2>
          <Link href="/" className="btn-primary">Go to Home</Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold text-[#1F2937] mb-2 heading-font">Join as a Doctor</h1>
          <p className="text-[#4B5563]">Apply to join {clinic.name}</p>
        </motion.div>

        <DoctorApplicationForm clinic={{ id: clinic.id, name: clinic.name, city: clinic.city, country: clinic.country }} />
      </div>
    </div>
  );
};

export default ClinicDoctorApplyPage;
