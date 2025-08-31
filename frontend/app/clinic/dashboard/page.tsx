'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, Users, Check, X, ArrowLeft, Stethoscope, Copy, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';

interface ClinicApplication {
  id: number;
  name: string;
  email: string;
  specialty: string;
  location: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface Clinic {
  id: number;
  name: string;
}

const ClinicDashboardPage: React.FC = () => {
  const { isAuthenticated, isClinicAdmin, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [applications, setApplications] = useState<ClinicApplication[]>([]);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [applicationsRes, clinicInfoRes] = await Promise.all([
        fetch(buildApiUrl(API_ENDPOINTS.clinicApplications), { credentials: 'include' }),
        fetch(buildApiUrl(API_ENDPOINTS.clinicInfo), { credentials: 'include' }),
      ]);
      if (!applicationsRes.ok || !clinicInfoRes.ok) throw new Error('Failed to fetch');
      const applicationsJson = await applicationsRes.json();
      const clinicInfoJson = await clinicInfoRes.json();
      setApplications(applicationsJson.applications || []);
      setClinic(clinicInfoJson.clinic);
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isClinicAdmin) fetchData();
  }, [isAuthenticated, isClinicAdmin]);

  const approve = async (id: number) => {
    const res = await fetch(buildApiUrl(API_ENDPOINTS.clinicApproveApplication(String(id))), { method: 'POST', credentials: 'include' });
    if (res.ok) {
      addToast({ type: 'success', title: 'Approved', message: 'Doctor approved' });
      fetchData();
    }
  };
  const reject = async (id: number) => {
    const res = await fetch(buildApiUrl(API_ENDPOINTS.clinicRejectApplication(String(id))), { method: 'POST', credentials: 'include' });
    if (res.ok) {
      addToast({ type: 'success', title: 'Rejected', message: 'Application rejected' });
      fetchData();
    }
  };

  const copyApplicationLink = () => {
    if (!clinic) return;
    const link = `${window.location.origin}/clinic/${clinic.id}/apply`;
    navigator.clipboard.writeText(link);
    addToast({ type: 'success', title: 'Copied!', message: 'Application link copied to clipboard' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your access...</p>
        </div>
      </div>
    );
  }

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
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-[#0E6BA8] hover:text-[#0B5A8A] mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-4xl font-bold text-[#1F2937] heading-font">Clinic Dashboard</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Applications */}
          <div className="card-hover p-6">
            <h2 className="text-2xl font-semibold mb-4">Doctor Applications</h2>
            {loading ? (
              <div className="spinner" />
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <div key={app.id} className="p-4 bg-white rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold flex items-center gap-2"><Stethoscope className="w-4 h-4" /> {app.name}</div>
                        <div className="text-sm text-gray-600">{app.email} • {app.location}</div>
                        <div className="text-xs text-gray-500">{app.specialty}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => approve(app.id)} disabled={app.status !== 'PENDING'} className="btn-primary disabled:opacity-50 flex items-center gap-1"><Check className="w-4 h-4" />Approve</button>
                        <button onClick={() => reject(app.id)} disabled={app.status !== 'PENDING'} className="btn-outline disabled:opacity-50 flex items-center gap-1"><X className="w-4 h-4" />Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
                {applications.length === 0 && <div className="text-sm text-gray-600">No applications</div>}
              </div>
            )}
          </div>

          {/* Quick Links and Application Link */}
          <div className="space-y-6">
            <div className="card-hover p-6">
              <h2 className="text-2xl font-semibold mb-4">Manage</h2>
              <div className="space-y-3">
                <Link href="/clinic/doctors" className="btn-primary flex items-center gap-2"><Users className="w-4 h-4" /> Manage Doctors</Link>
                <Link href="/clinic/info" className="btn-secondary flex items-center gap-2"><Building2 className="w-4 h-4" /> Edit Clinic Info</Link>
              </div>
            </div>

            {/* Application Link */}
            {clinic && (
              <div className="card-hover p-6">
                <h2 className="text-2xl font-semibold mb-4">Doctor Application Link</h2>
                <p className="text-sm text-gray-600 mb-4">Share this link with doctors who want to join your clinic:</p>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm font-mono text-gray-700 break-all">
                    <LinkIcon className="w-4 h-4 flex-shrink-0" />
                    <span>{`${window.location.origin}/clinic/${clinic.id}/apply`}</span>
                  </div>
                </div>
                <button onClick={copyApplicationLink} className="btn-secondary mt-3 flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicDashboardPage;


