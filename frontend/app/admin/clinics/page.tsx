'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';
import { ArrowLeft, Building2, Shield, Users, Clock, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

interface ClinicRow {
  id: number;
  name: string;
  email: string;
  city?: string;
  country?: string;
  active?: boolean;
  admins?: { 
    user: { id: number; name: string; email: string; role: string };
    generatedPassword?: string;
  }[];
}

interface ClinicApplication {
  id: number;
  name: string;
  email: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  zip?: string;
  website?: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const AdminClinicsPage: React.FC = () => {
  const { isAuthenticated, isSuperAdmin, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [clinics, setClinics] = useState<ClinicRow[]>([]);
  const [clinicApplications, setClinicApplications] = useState<ClinicApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCredentials, setShowCredentials] = useState<{[key: number]: boolean}>({});
  const [processingApplication, setProcessingApplication] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch existing clinics
        const clinicsRes = await fetch(buildApiUrl(API_ENDPOINTS.adminClinics), { credentials: 'include' });
        const clinicsBody = await clinicsRes.json();
        if (!clinicsRes.ok) throw new Error(clinicsBody.error || 'Failed to fetch clinics');
        setClinics(clinicsBody.clinics || []);

        // Fetch clinic applications
        const appsRes = await fetch(buildApiUrl(API_ENDPOINTS.adminClinicApplications), { credentials: 'include' });
        const appsBody = await appsRes.json();
        if (!appsRes.ok) throw new Error(appsBody.error || 'Failed to fetch clinic applications');
        setClinicApplications(appsBody.applications || []);
      } catch (e: any) {
        addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && isSuperAdmin) fetchData();
  }, [isAuthenticated, isSuperAdmin, addToast]);

  const handleApproveApplication = async (applicationId: number) => {
    try {
      setProcessingApplication(applicationId);
      const res = await fetch(buildApiUrl(API_ENDPOINTS.adminApproveClinicApplication(applicationId.toString())), {
        method: 'POST',
        credentials: 'include'
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to approve application');
      
      addToast({ 
        type: 'success', 
        title: 'Clinic Approved', 
        message: `Clinic "${body.clinic.name}" has been approved. Admin credentials: ${body.email} / ${body.password}` 
      });
      
      // Refresh data
      const clinicsRes = await fetch(buildApiUrl(API_ENDPOINTS.adminClinics), { credentials: 'include' });
      const clinicsBody = await clinicsRes.json();
      if (clinicsRes.ok) setClinics(clinicsBody.clinics || []);
      
      const appsRes = await fetch(buildApiUrl(API_ENDPOINTS.adminClinicApplications), { credentials: 'include' });
      const appsBody = await appsRes.json();
      if (appsRes.ok) setClinicApplications(appsBody.applications || []);
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to approve application' });
    } finally {
      setProcessingApplication(null);
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    try {
      setProcessingApplication(applicationId);
      const res = await fetch(buildApiUrl(API_ENDPOINTS.adminRejectClinicApplication(applicationId.toString())), {
        method: 'POST',
        credentials: 'include'
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to reject application');
      
      addToast({ type: 'success', title: 'Application Rejected', message: 'Clinic application has been rejected' });
      
      // Refresh applications
      const appsRes = await fetch(buildApiUrl(API_ENDPOINTS.adminClinicApplications), { credentials: 'include' });
      const appsBody = await appsRes.json();
      if (appsRes.ok) setClinicApplications(appsBody.applications || []);
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to reject application' });
    } finally {
      setProcessingApplication(null);
    }
  };

  const toggleCredentials = (clinicId: number) => {
    setShowCredentials(prev => ({
      ...prev,
      [clinicId]: !prev[clinicId]
    }));
  };

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

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="inline-flex items-center space-x-2 text-[#0E6BA8] hover:text-[#0B5A8A] mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-4xl font-bold text-[#1F2937] heading-font flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#0E6BA8]" /> Clinics Management
          </h1>
        </div>

        {loading ? (
          <div className="card-hover p-6">Loading...</div>
        ) : (
          <div className="space-y-8">
            {/* Clinic Applications Section */}
            {clinicApplications.filter(app => app.status === 'PENDING').length > 0 && (
              <div className="card-hover">
                <h2 className="text-2xl font-semibold text-[#1F2937] mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-[#F59E0B]" />
                  Pending Clinic Applications
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {clinicApplications
                    .filter(app => app.status === 'PENDING')
                    .map(app => (
                      <div key={app.id} className="p-4 bg-white rounded-lg border border-yellow-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-[#1F2937]">{app.name}</h3>
                            <p className="text-sm text-[#4B5563]">{app.email}</p>
                            <p className="text-sm text-[#4B5563]">{app.city}, {app.country}</p>
                          </div>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Pending
                          </span>
                        </div>
                        
                        <div className="text-sm text-[#4B5563] mb-3">
                          <p><strong>Address:</strong> {app.addressLine1} {app.addressLine2}</p>
                          <p><strong>Phone:</strong> {app.phone || 'N/A'}</p>
                          <p><strong>Website:</strong> {app.website || 'N/A'}</p>
                          {app.description && (
                            <p><strong>Description:</strong> {app.description}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveApplication(app.id)}
                            disabled={processingApplication === app.id}
                            className="btn-primary text-xs flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            {processingApplication === app.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleRejectApplication(app.id)}
                            disabled={processingApplication === app.id}
                            className="btn-danger text-xs flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            {processingApplication === app.id ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Existing Clinics Section */}
            <div className="card-hover">
              <h2 className="text-2xl font-semibold text-[#1F2937] mb-6 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#0E6BA8]" />
                Existing Clinics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clinics.map(clinic => (
                  <div key={clinic.id} className="p-4 bg-white rounded-lg border card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#1F2937] truncate">{clinic.name}</h3>
                        <p className="text-sm text-[#4B5563] break-words">{clinic.email}</p>
                        <p className="text-sm text-[#4B5563] truncate">{clinic.city}{clinic.country ? `, ${clinic.country}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          clinic.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {clinic.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Clinic Admin Credentials */}
                    {clinic.admins && clinic.admins.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#1F2937] flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Admin Credentials
                          </span>
                          <button
                            onClick={() => toggleCredentials(clinic.id)}
                            className="text-[#0E6BA8] hover:text-[#0B5A8A] text-xs flex items-center gap-1"
                          >
                            {showCredentials[clinic.id] ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                Show
                              </>
                            )}
                          </button>
                        </div>
                        
                        {showCredentials[clinic.id] && clinic.admins.map((admin, index) => (
                          <div key={admin.user.id} className="bg-gray-50 p-2 rounded text-xs">
                            <p><strong>Email:</strong> {admin.user.email}</p>
                            <p><strong>Name:</strong> {admin.user.name}</p>
                            <p><strong>Role:</strong> {admin.user.role}</p>
                            <p><strong>Password:</strong> <span className="text-[#0E6BA8] font-mono">{admin.generatedPassword || 'Generated during approval'}</span></p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/clinics/${clinic.id}`} className="btn-secondary text-xs">Manage</Link>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this clinic? This cannot be undone.')) return;
                          try {
                            const res = await fetch(buildApiUrl(API_ENDPOINTS.adminDeleteClinic(String(clinic.id))), { 
                              method: 'DELETE', 
                              credentials: 'include' 
                            });
                            const body = await res.json();
                            if (!res.ok) throw new Error(body.error || 'Failed to delete');
                            setClinics(prev => prev.filter(x => x.id !== clinic.id));
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
                {clinics.length === 0 && (
                  <div className="text-sm text-gray-500 p-4 col-span-full">No clinics found</div>
                )}
              </div>
            </div>

            {/* Rejected Applications Section */}
            {clinicApplications.filter(app => app.status === 'REJECTED').length > 0 && (
              <div className="card-hover">
                <h2 className="text-2xl font-semibold text-[#1F2937] mb-6 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-[#DC2626]" />
                  Rejected Applications
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {clinicApplications
                    .filter(app => app.status === 'REJECTED')
                    .map(app => (
                      <div key={app.id} className="p-4 bg-white rounded-lg border border-red-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-[#1F2937]">{app.name}</h3>
                            <p className="text-sm text-[#4B5563]">{app.email}</p>
                            <p className="text-sm text-[#4B5563]">{app.city}, {app.country}</p>
                          </div>
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Rejected
                          </span>
                        </div>
                        <p className="text-xs text-[#4B5563]">
                          Rejected on: {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClinicsPage;
