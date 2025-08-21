"use client";

import Link from 'next/link';
import DoctorApplicationForm from '@/components/DoctorApplicationForm';

const DoctorApplyPage: React.FC = () => {
  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-[#0E6BA8] hover:text-[#0B5A8A] mb-6 font-medium">
            <span>Back to Home</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-3 heading-font">Doctor Application</h1>
          <p className="text-[#4B5563] text-lg">Fill the form below to apply as a doctor. An admin will review your application.</p>
        </div>
        <DoctorApplicationForm />
      </div>
    </div>
  );
};

export default DoctorApplyPage;


