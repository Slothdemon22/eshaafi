"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';
import { Mail, Phone, MapPin, Stethoscope, BookText, User, Plus, Trash2, Building2 } from 'lucide-react';

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

interface ClinicInfo {
  id: number;
  name: string;
  city?: string;
  country?: string;
}

interface DoctorApplicationFormProps {
  clinic?: ClinicInfo | null;
}

const DoctorApplicationForm: React.FC<DoctorApplicationFormProps> = ({ clinic }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [specialities, setSpecialities] = useState<{ value: string, label: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [education, setEducation] = useState([{ degree: '', institution: '', year: '' }]);
  const [workExperience, setWorkExperience] = useState([{ title: '', organization: '', years: '' }]);

  useEffect(() => {
    fetch(buildApiUrl(API_ENDPOINTS.doctorSpecialities))
      .then(res => res.json())
      .then(setSpecialities)
      .catch(() => setSpecialities([]));
  }, []);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      const payload: any = {
        ...data,
        experienceYears: data.experienceYears ? Number(data.experienceYears) : undefined,
        education,
        workExperience,
      };
      if (clinic?.id) {
        payload.clinicId = clinic.id;
      }
      const res = await fetch(buildApiUrl(API_ENDPOINTS.doctorApply), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to submit');
      setSuccess('Application submitted successfully. You will be notified upon approval.');
      reset();
      setEducation([{ degree: '', institution: '', year: '' }]);
      setWorkExperience([{ title: '', organization: '', years: '' }]);
      setSpecialtySearch('');
      setValue('specialty', '');
    } catch (e: any) {
      setError(e.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-hover">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {success && <div className="p-4 bg-[#ECFDF5] border border-[#16A34A]/20 text-[#065F46] rounded-lg">{success}</div>}
        {error && <div className="p-4 bg-[#FEF2F2] border border-[#DC2626]/20 text-[#991B1B] rounded-lg">{error}</div>}

        {clinic && (
          <div className="bg-[#F0F9FF] p-4 rounded-lg border border-[#0E6BA8]/20">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="w-5 h-5 text-[#0E6BA8]" />
              <span className="font-semibold text-[#0E6BA8]">Clinic Information</span>
            </div>
            <div className="text-sm text-[#1F2937]">
              <div><strong>Name:</strong> {clinic.name}</div>
              {(clinic.city || clinic.country) && (
                <div><strong>Location:</strong> {clinic.city || '-'}{clinic.country ? `, ${clinic.country}` : ''}</div>
              )}
            </div>
          </div>
        )}

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

        <div className="mb-6 bg-blue-50/60 rounded-lg p-4">
          <label className="block text-sm font-semibold text-[#1F2937] mb-3">Education</label>
          {education.map((edu, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-2 items-center mb-2">
              <input
                type="text"
                placeholder="Degree"
                value={edu.degree}
                onChange={e => setEducation(education.map((ed, i) => i === idx ? { ...ed, degree: e.target.value } : ed))}
                className="input-field w-full md:w-1/4"
              />
              <input
                type="text"
                placeholder="Institution"
                value={edu.institution}
                onChange={e => setEducation(education.map((ed, i) => i === idx ? { ...ed, institution: e.target.value } : ed))}
                className="input-field w-full md:w-1/3"
              />
              <input
                type="text"
                placeholder="Year"
                value={edu.year}
                onChange={e => setEducation(education.map((ed, i) => i === idx ? { ...ed, year: e.target.value } : ed))}
                className="input-field w-full md:w-1/6"
              />
              <button type="button" onClick={() => setEducation(education.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-100 rounded p-1 ml-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => setEducation([...education, { degree: '', institution: '', year: '' }])} className="text-blue-600 flex items-center mt-2 hover:bg-blue-100 rounded px-2 py-1"><Plus className="w-4 h-4 mr-1" />Add Education</button>
        </div>

        <div className="mb-6 bg-green-50/60 rounded-lg p-4">
          <label className="block text-sm font-semibold text-[#1F2937] mb-3">Work Experience</label>
          {workExperience.map((exp, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-2 items-center mb-2">
              <input
                type="text"
                placeholder="Title"
                value={exp.title}
                onChange={e => setWorkExperience(workExperience.map((ex, i) => i === idx ? { ...ex, title: e.target.value } : ex))}
                className="input-field w-full md:w-1/4"
              />
              <input
                type="text"
                placeholder="Organization"
                value={exp.organization}
                onChange={e => setWorkExperience(workExperience.map((ex, i) => i === idx ? { ...ex, organization: e.target.value } : ex))}
                className="input-field w-full md:w-1/3"
              />
              <input
                type="text"
                placeholder="Years"
                value={exp.years}
                onChange={e => setWorkExperience(workExperience.map((ex, i) => i === idx ? { ...ex, years: e.target.value } : ex))}
                className="input-field w-full md:w-1/6"
              />
              <button type="button" onClick={() => setWorkExperience(workExperience.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-100 rounded p-1 ml-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => setWorkExperience([...workExperience, { title: '', organization: '', years: '' }])} className="text-green-600 flex items-center mt-2 hover:bg-green-100 rounded px-2 py-1"><Plus className="w-4 h-4 mr-1" />Add Experience</button>
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
  );
};

export default DoctorApplicationForm;


