'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';
import { ArrowLeft, Building2, Shield } from 'lucide-react';

interface ClinicRow {
  id: number;
  name: string;
  email: string;
  city?: string;
  country?: string;
}

const AdminClinicsPage: React.FC = () => {
  const { isAuthenticated, isSuperAdmin, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [clinics, setClinics] = useState<ClinicRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        const res = await fetch(buildApiUrl(API_ENDPOINTS.adminClinics), { credentials: 'include' });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Failed to fetch clinics');
        setClinics(body.clinics || []);
      } catch (e: any) {
        addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to load clinics' });
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && isSuperAdmin) fetchClinics();
  }, [isAuthenticated, isSuperAdmin, addToast]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-[#4B5563] font-medium">Checking your access...</p>
        </div>
      </div>
    );
  }

  // Remove access denied page; just keep loader and rely on server guarding APIs

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="inline-flex items-center space-x-2 text-[#0E6BA8] hover:text-[#0B5A8A] mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-4xl font-bold text-[#1F2937] heading-font flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#0E6BA8]" /> Clinics
          </h1>
        </div>

        <div className="card-hover overflow-x-hidden">
          {loading ? (
            <div className="p-6">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
              {clinics.map(c => (
                <div key={c.id} className="p-4 bg-white rounded-lg border card-hover w-full h-full flex flex-col">
                  <Link href={`/admin/clinics/${c.id}`} className="block min-w-0">
                    <div className="font-semibold text-[#1F2937] truncate">{c.name}</div>
                    <div className="text-sm text-[#4B5563] break-words">{c.email}</div>
                    <div className="text-sm text-[#4B5563] truncate">{c.city}{c.country ? `, ${c.country}` : ''}</div>
                  </Link>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link href={`/admin/clinics/${c.id}`} className="btn-secondary text-xs">Edit Info</Link>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this clinic? This cannot be undone.')) return;
                        try {
                          const res = await fetch(buildApiUrl(API_ENDPOINTS.adminDeleteClinic(String(c.id))), { method: 'DELETE', credentials: 'include' });
                          const body = await res.json();
                          if (!res.ok) throw new Error(body.error || 'Failed to delete');
                          setClinics(prev => prev.filter(x => x.id !== c.id));
                          addToast({ type: 'success', title: 'Deleted', message: 'Clinic deleted' });
                        } catch (e: any) {
                          addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to delete clinic' });
                        }
                      }}
                      className="btn-danger text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {clinics.length === 0 && <div className="text-sm text-gray-500 p-4">No clinics found</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminClinicsPage;
