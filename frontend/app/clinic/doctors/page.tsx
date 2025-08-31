'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserMinus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';

interface Doctor {
  id: number;
  user: { id: number; name: string; email: string };
}

interface DoctorStatRow {
  doctorId: number;
  name: string;
  email: string;
  specialty: string;
  total: number;
  pending: number;
  booked: number;
  completed: number;
  rejected: number;
  reviewCount: number;
  averageRating: number;
}

const ClinicDoctorsPage: React.FC = () => {
  const { isAuthenticated, isClinicAdmin } = useAuth();
  const { addToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DoctorStatRow[]>([]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetch(buildApiUrl(API_ENDPOINTS.clinicDoctors), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch doctors');
      const json = await res.json();
      setDoctors(json.doctors || []);
      // Stats
      const sres = await fetch(buildApiUrl(API_ENDPOINTS.clinicDoctorStats), { credentials: 'include' });
      if (sres.ok) {
        const sjson = await sres.json();
        setStats(sjson.stats || []);
      }
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to load doctors' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isClinicAdmin) fetchDoctors();
  }, [isAuthenticated, isClinicAdmin]);

  const removeDoctor = async (id: number) => {
    const ok = confirm('Remove this doctor from your clinic?');
    if (!ok) return;
    const res = await fetch(buildApiUrl(API_ENDPOINTS.clinicRemoveDoctor(String(id))), { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      addToast({ type: 'success', title: 'Removed', message: 'Doctor removed from clinic' });
      fetchDoctors();
    }
  };

  if (!isAuthenticated || !isClinicAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Access Denied</h2>
          <Link href="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/clinic/dashboard" className="inline-flex items-center space-x-2 text-[#0E6BA8] hover:text-[#0B5A8A] mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-4xl font-bold text-[#1F2937] heading-font">Manage Doctors</h1>
        </motion.div>

        <div className="card-hover p-6">
          {loading ? (
            <div className="spinner" />
          ) : (
            <div className="space-y-6">
              {/* Stats table */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Doctors Overview</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 text-left">
                        <th className="py-2 px-3">Doctor</th>
                        <th className="py-2 px-3">Specialty</th>
                        <th className="py-2 px-3">Total</th>
                        <th className="py-2 px-3">Pending</th>
                        <th className="py-2 px-3">Booked</th>
                        <th className="py-2 px-3">Completed</th>
                        <th className="py-2 px-3">Rejected</th>
                        <th className="py-2 px-3">Reviews</th>
                        <th className="py-2 px-3">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map(r => (
                        <tr key={r.doctorId} className="border-b border-gray-100">
                          <td className="py-2 px-3">
                            <div className="font-medium">{r.name}</div>
                            <div className="text-xs text-gray-500">{r.email}</div>
                          </td>
                          <td className="py-2 px-3">{r.specialty}</td>
                          <td className="py-2 px-3">{r.total}</td>
                          <td className="py-2 px-3">{r.pending}</td>
                          <td className="py-2 px-3">{r.booked}</td>
                          <td className="py-2 px-3">{r.completed}</td>
                          <td className="py-2 px-3">{r.rejected}</td>
                          <td className="py-2 px-3">
                            {r.reviewCount > 0 ? r.reviewCount : '-'}
                          </td>
                          <td className="py-2 px-3">
                            {r.averageRating > 0 ? `${r.averageRating.toFixed(1)}/5` : '-'}
                          </td>
                        </tr>
                      ))}
                      {stats.length === 0 && (
                        <tr><td className="py-3 px-3 text-sm text-gray-500" colSpan={9}>No data</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Doctors list with remove */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Doctors</h2>
                {doctors.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-4 bg-white rounded border">
                    <div>
                      <div className="font-semibold">{d.user?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-600">{d.user?.email}</div>
                    </div>
                    <button onClick={() => removeDoctor(d.id)} className="btn-outline flex items-center gap-1"><UserMinus className="w-4 h-4" />Remove</button>
                  </div>
                ))}
                {doctors.length === 0 && <div className="text-sm text-gray-600">No doctors in your clinic yet.</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicDoctorsPage;


