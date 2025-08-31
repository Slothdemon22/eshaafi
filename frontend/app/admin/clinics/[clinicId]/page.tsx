'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';
import { ArrowLeft, Shield, Building2, Stethoscope, Calendar, UserCheck, Users } from 'lucide-react';

interface ClinicDetails {
  id: number;
  name: string;
  email: string;
  city?: string;
  country?: string;
  admins?: { 
    user: { id: number; name: string; email: string; role: string };
    generatedPassword?: string;
  }[];
  doctors?: { 
    id: number; 
    user: { id: number; name: string; email: string }; 
    reviewCount?: number;
    averageRating?: number;
  }[];
}

const AdminClinicDetailsPage: React.FC = () => {
  const { clinicId } = useParams();
  const { isAuthenticated, isSuperAdmin } = useAuth();
  const { addToast } = useToast();
  const [clinic, setClinic] = useState<ClinicDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [toggling, setToggling] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    website: '',
    logoUrl: '',
    description: ''
  });

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        setLoading(true);
        const res = await fetch(buildApiUrl(API_ENDPOINTS.adminClinicDetails(clinicId as string)), { credentials: 'include' });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Failed to fetch clinic');
        setClinic(body.clinic);
        setForm({
          name: body.clinic?.name || '',
          email: body.clinic?.email || '',
          phone: body.clinic?.phone || '',
          addressLine1: body.clinic?.addressLine1 || '',
          addressLine2: body.clinic?.addressLine2 || '',
          city: body.clinic?.city || '',
          state: body.clinic?.state || '',
          country: body.clinic?.country || '',
          zip: body.clinic?.zip || '',
          website: body.clinic?.website || '',
          logoUrl: body.clinic?.logoUrl || '',
          description: body.clinic?.description || ''
        });
        // Fetch clinic appointments
        const apRes = await fetch(buildApiUrl(API_ENDPOINTS.adminClinicAppointments(clinicId as string)), { credentials: 'include' });
        if (apRes.ok) {
          const apBody = await apRes.json();
          setAppointments(apBody.appointments || []);
        } else {
          setAppointments([]);
        }
      } catch (e: any) {
        addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to load clinic' });
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && isSuperAdmin) fetchClinic();
  }, [isAuthenticated, isSuperAdmin, clinicId, addToast]);

  const toggleClinicActive = async (active: boolean) => {
    try {
      setToggling(true);
      const res = await fetch(buildApiUrl(API_ENDPOINTS.adminSetClinicActive(clinicId as string)), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ active })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to update status');
      setClinic(prev => prev ? { ...prev, active } as any : prev);
      addToast({ type: 'success', title: 'Updated', message: `Clinic ${active ? 'activated' : 'deactivated'}` });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to update' });
    } finally {
      setToggling(false);
    }
  };

  // Removed access denied page; rely on loader and API guards

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/clinics" className="inline-flex items-center space-x-2 text-[#0E6BA8] hover:text-[#0B5A8A] mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Clinics</span>
          </Link>
          <h1 className="text-4xl font-bold text-[#1F2937] heading-font flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#0E6BA8]" />
            Clinic Details
          </h1>
        </div>

        {loading ? (
          <div className="card-hover p-6">Loading...</div>
        ) : clinic ? (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-hover p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Basic Info</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing((e) => !e)} className="btn-secondary text-xs">{editing ? 'Cancel' : 'Edit Info'}</button>
                </div>
              </div>
              {!editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#1F2937]">
                  <div><span className="font-semibold">Name:</span> {clinic.name}</div>
                  <div><span className="font-semibold">Email:</span> {clinic.email}</div>
                  <div><span className="font-semibold">Phone:</span> {(clinic as any).phone || '-'}</div>
                  <div><span className="font-semibold">Website:</span> {(clinic as any).website || '-'}</div>
                  <div className="md:col-span-2"><span className="font-semibold">Address:</span> {(clinic as any).addressLine1 || ''} {(clinic as any).addressLine2 || ''}</div>
                  <div><span className="font-semibold">City:</span> {clinic.city || '-'}</div>
                  <div><span className="font-semibold">State:</span> {(clinic as any).state || '-'}</div>
                  <div><span className="font-semibold">Country:</span> {clinic.country || '-'}</div>
                  <div><span className="font-semibold">Zip:</span> {(clinic as any).zip || '-'}</div>
                  <div className="md:col-span-2"><span className="font-semibold">Description:</span> {(clinic as any).description || '-'}</div>
                  {'active' in clinic && (
                    <div className="flex items-center gap-3 md:col-span-2">
                      <span className="font-semibold">Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${ (clinic as any).active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }`}>
                        {(clinic as any).active ? 'Active' : 'Inactive'}
                      </span>
                      <button disabled={toggling} onClick={() => toggleClinicActive(!(clinic as any).active)} className="btn-secondary text-xs">
                        {(clinic as any).active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const res = await fetch(buildApiUrl(API_ENDPOINTS.adminUpdateClinic(clinicId as string)), {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(form)
                      });
                      const body = await res.json();
                      if (!res.ok) throw new Error(body.error || 'Failed to update clinic');
                      setClinic((prev) => prev ? { ...prev, ...form } as any : prev);
                      setEditing(false);
                      addToast({ type: 'success', title: 'Updated', message: 'Clinic info updated' });
                    } catch (err: any) {
                      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to update clinic' });
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {Object.entries(form).map(([key, value]) => (
                    <div key={key} className={key === 'description' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                      {key === 'description' ? (
                        <textarea
                          value={value as string}
                          onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                          className="input-field"
                          rows={3}
                        />
                      ) : (
                        <input
                          type="text"
                          value={value as string}
                          onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                          className="input-field"
                        />
                      )}
                    </div>
                  ))}
                  <div className="md:col-span-2 flex items-center gap-2">
                    <button type="submit" className="btn-primary text-sm">Save</button>
                    <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
                  </div>
                </form>
              )}
            </motion.div>

            {/* Clinic Admin Credentials Section */}
            {clinic.admins && clinic.admins.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-hover p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#0E6BA8]" />
                  Clinic Admin Credentials
                </h2>
                <div className="space-y-4">
                  {clinic.admins.map((admin, index) => (
                    <div key={admin.user.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-[#1F2937] flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {admin.user.name}
                          </h3>
                          <p className="text-sm text-[#4B5563]">Role: {admin.user.role}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          Admin #{index + 1}
                        </span>
                      </div>
                      
                      <div className="bg-white p-3 rounded border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-semibold text-[#1F2937]">Email:</span>
                            <p className="text-[#0E6BA8] font-mono bg-gray-50 p-2 rounded mt-1">{admin.user.email}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-[#1F2937]">Password:</span>
                            <p className="text-[#0E6BA8] font-mono bg-gray-50 p-2 rounded mt-1">
                              {admin.generatedPassword || 'Generated during approval'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-xs text-yellow-800 font-medium">
                            💡 <strong>Note:</strong> This admin can log in using the email and password above. 
                            The password was generated during clinic approval and should be shared securely with the clinic admin.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-hover p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Stethoscope className="w-5 h-5" /> Doctors</h2>
              <div className="space-y-2">
                {clinic.doctors?.map((d) => (
                  <div key={d.id} className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{d.user?.name}</div>
                        <div className="text-sm text-gray-600">{d.user?.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {'active' in d && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${ (d as any).active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }`}>
                            {(d as any).active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                        {d.reviewCount !== undefined && d.reviewCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            {d.reviewCount} review{d.reviewCount === 1 ? '' : 's'} • {d.averageRating?.toFixed(1)}/5
                          </span>
                        )}
                        <Link href={`/doctors/${d.id}`} className="btn-secondary">View Profile</Link>
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(buildApiUrl(API_ENDPOINTS.adminSetDoctorActive(d.id)), {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ active: !(d as any).active })
                              });
                              const body = await res.json();
                              if (!res.ok) throw new Error(body.error || 'Failed');
                              setClinic(prev => prev ? {
                                ...prev,
                                doctors: prev.doctors?.map(doc => doc.id === d.id ? { ...doc, active: !(d as any).active } as any : doc)
                              } as any : prev);
                              addToast({ type: 'success', title: 'Updated', message: `Doctor ${(d as any).active ? 'deactivated' : 'activated'}` });
                            } catch (e: any) {
                              addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to update doctor' });
                            }
                          }}
                          className="btn-outline text-xs"
                        >
                          {(d as any).active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!clinic.doctors || clinic.doctors.length === 0) && (
                  <div className="text-sm text-gray-500">No doctors in this clinic</div>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-hover p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Recent Appointments</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Patient</th>
                      <th className="text-left py-3 px-4">Doctor</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 gradient-secondary rounded-full flex items-center justify-center"><UserCheck className="w-4 h-4 text-white" /></div>
                            <div>
                              <div className="font-medium">{a.patient?.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{a.patient?.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{a.doctor?.name || 'Unknown'}</td>
                        <td className="py-3 px-4">{new Date(a.dateTime).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            a.status === 'COMPLETED' ? 'bg-[#ECFDF5] text-[#065F46]' :
                            a.status === 'PENDING' ? 'bg-[#FFFBEB] text-[#92400E]' :
                            a.status === 'BOOKED' ? 'bg-[#EFF6FF] text-[#1E3A8A]' :
                            'bg-[#FEF2F2] text-[#991B1B]'
                          }`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr><td className="py-4 px-4 text-sm text-gray-500" colSpan={4}>No appointments found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="card-hover p-6">Clinic not found</div>
        )}
      </div>
    </div>
  );
};

export default AdminClinicDetailsPage;


