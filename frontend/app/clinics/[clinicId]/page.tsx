'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';
import { MapPin, Stethoscope, Calendar, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';

interface Clinic { id: number; name: string; city?: string; country?: string; }
interface Doctor { id: number; specialty: string; location: string; user: { name: string; email: string } }

const PublicClinicPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const clinicId = params?.clinicId as string;
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cRes, dRes] = await Promise.all([
          fetch(buildApiUrl(API_ENDPOINTS.getClinicById(clinicId))),
          fetch(buildApiUrl(API_ENDPOINTS.getPublicClinicDoctors(clinicId)))
        ]);
        if (!cRes.ok) throw new Error('Clinic not found');
        const cJson = await cRes.json();
        setClinic(cJson.clinic);
        if (dRes.ok) {
          const dJson = await dRes.json();
          setDoctors(dJson.doctors || []);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load clinic');
      } finally {
        setLoading(false);
      }
    };
    if (clinicId) fetchData();
  }, [clinicId]);

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-[#0E6BA8] hover:underline inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" />Back</button>
        </div>
        {loading ? (
          <div className="card-hover p-6 text-center">Loading...</div>
        ) : error || !clinic ? (
          <div className="card-hover p-6 text-center text-red-600">{error || 'Clinic not found'}</div>
        ) : (
          <div className="space-y-6">
            <div className="card-hover p-6">
              <h1 className="text-3xl font-bold text-[#1F2937] heading-font">{clinic.name}</h1>
              <div className="text-sm text-[#4B5563] flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" />{clinic.city || '-'}{clinic.country ? `, ${clinic.country}` : ''}</div>
            </div>

            <div className="card-hover p-6">
              <h2 className="text-xl font-semibold mb-3">Doctors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map(d => (
                  <div key={d.id} className="p-4 bg-white rounded border">
                    <div className="flex items-center gap-2 mb-1"><Stethoscope className="w-4 h-4 text-[#0E6BA8]" /><div className="font-semibold">{d.user.name}</div></div>
                    <div className="text-sm text-gray-600">{d.user.email}</div>
                    <div className="text-sm text-gray-700 mt-1">{d.specialty}</div>
                    <div className="text-sm text-gray-700">{d.location || '-'}</div>
                    <div className="flex gap-2 mt-3">
                      <Link href={`/doctors/${d.id}`} className="btn-secondary">View Profile</Link>
                      <Link href={`/book-appointment?doctorId=${d.id}`} className="btn-primary flex items-center gap-1"><Calendar className="w-4 h-4" />Book</Link>
                    </div>
                  </div>
                ))}
                {doctors.length === 0 && (
                  <div className="text-sm text-gray-500">No doctors available</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicClinicPage;


