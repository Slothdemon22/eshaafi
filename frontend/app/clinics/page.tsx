'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import { Search, MapPin } from 'lucide-react';

interface Clinic {
  id: number;
  name: string;
  city?: string;
  country?: string;
  logoUrl?: string;
  description?: string;
}

const PublicClinicsPage: React.FC = () => {
  const { isAuthenticated, isPatient } = useAuth();
  const { addToast } = useToast();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        const res = await fetch(buildApiUrl(API_ENDPOINTS.getPublicClinics));
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Failed to fetch clinics');
        setClinics(body.clinics || []);
      } catch (e: any) {
        addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to load clinics' });
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, [addToast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    return clinics.filter(c => {
      const nameMatch = !q || c.name.toLowerCase().includes(q);
      const locStr = `${c.city || ''} ${c.country || ''}`.toLowerCase();
      const locMatch = !loc || locStr.includes(loc);
      return nameMatch && locMatch;
    });
  }, [clinics, query, location]);

  // Allow visitors and patients; restrict others
  if (isAuthenticated && !isPatient) {
    return (
      <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto card-hover p-6 text-center">
          This page is for visitors and patients.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1F2937] heading-font">Clinics</h1>
          <p className="text-[#4B5563]">Browse active clinics and their doctors.</p>
        </div>

        <div className="card-hover p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} className="input-field pl-9" placeholder="Search clinics by name..." />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={location} onChange={e => setLocation(e.target.value)} className="input-field pl-9" placeholder="Filter by city or country..." />
          </div>
        </div>

        {loading ? (
          <div className="card-hover p-6 text-center">Loading clinics...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => (
              <Link key={c.id} href={`/clinics/${c.id}`} className="card-hover p-4">
                <div className="flex items-center gap-3 mb-2">
                  {c.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logoUrl} alt={c.name} className="h-10 w-10 rounded object-cover border" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-100" />)
                  }
                  <div className="font-semibold text-[#1F2937]">{c.name}</div>
                </div>
                <div className="text-sm text-[#4B5563] flex items-center gap-1"><MapPin className="w-4 h-4" /> {c.city || '-'}{c.country ? `, ${c.country}` : ''}</div>
                {c.description && (
                  <div className="text-sm text-gray-600 mt-2 line-clamp-2">{c.description}</div>
                )}
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="card-hover p-6 text-center text-sm text-gray-500">No clinics match your filters.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicClinicsPage;


