"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toaster";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/config";
import { Building2, ArrowLeft, Save, RotateCcw, Globe, Phone as PhoneIcon, MapPin, Image as ImageIcon, Mail } from "lucide-react";

interface ClinicInfoForm {
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
  logoUrl?: string;
  description?: string;
}

const defaultForm: ClinicInfoForm = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  zip: "",
  website: "",
  logoUrl: "",
  description: "",
};

const ClinicInfoPage: React.FC = () => {
  const { isAuthenticated, isClinicAdmin } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ClinicInfoForm>(defaultForm);
  const [initial, setInitial] = useState<ClinicInfoForm>(defaultForm);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const res = await fetch(buildApiUrl(API_ENDPOINTS.clinicInfo), { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch clinic info");
        const data = await res.json();
        const c = data.clinic || {};
        const mapped: ClinicInfoForm = {
          name: c.name || "",
          email: c.email || "",
          phone: c.phone || "",
          addressLine1: c.addressLine1 || "",
          addressLine2: c.addressLine2 || "",
          city: c.city || "",
          state: c.state || "",
          country: c.country || "",
          zip: c.zip || "",
          website: c.website || "",
          logoUrl: c.logoUrl || "",
          description: c.description || "",
        };
        setForm(mapped);
        setInitial(mapped);
      } catch (e: any) {
        addToast({ type: "error", title: "Error", message: e.message || "Failed to load clinic info" });
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && isClinicAdmin) fetchInfo();
  }, [isAuthenticated, isClinicAdmin, addToast]);

  const onChange = (key: keyof ClinicInfoForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const onReset = () => setForm(initial);

  const onSave = async () => {
    // Minimal client-side validation for key fields
    if (!form.name.trim() || !form.email.trim() || !form.addressLine1.trim() || !form.city.trim() || !form.country.trim()) {
      addToast({ type: "error", title: "Missing fields", message: "Name, email, address, city and country are required." });
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(buildApiUrl(API_ENDPOINTS.clinicUpdateInfo), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Update failed");
      addToast({ type: "success", title: "Saved", message: "Clinic info updated" });
      setInitial(form);
    } catch (e: any) {
      addToast({ type: "error", title: "Save failed", message: e.message || "Try again" });
    } finally {
      setSaving(false);
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
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/clinic/dashboard" className="inline-flex items-center space-x-2 text-[#0E6BA8] hover:text-[#0B5A8A] mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Clinic Dashboard</span>
          </Link>
          <h1 className="text-4xl font-bold text-[#1F2937] heading-font flex items-center gap-2">
            <Building2 className="w-8 h-8 text-[#0E6BA8]" />
            Clinic Info
          </h1>
          <p className="text-[#4B5563]">View and update your clinic details.</p>
        </motion.div>

        {loading ? (
          <div className="card-hover p-6">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Branding */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-hover p-6 space-y-4">
              <h2 className="text-xl font-semibold text-[#1F2937] flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#0E6BA8]" /> Branding</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Logo URL</label>
                  <input className="input-field" placeholder="https://..." value={form.logoUrl || ""} onChange={e => onChange("logoUrl", e.target.value)} />
                </div>
                <div className="flex items-center">
                  {form.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logoUrl} alt="Clinic logo preview" className="h-16 rounded object-contain border" />
                  ) : (
                    <div className="text-sm text-gray-500">Provide a logo URL to preview</div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Basic Info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-hover p-6 space-y-4">
              <h2 className="text-xl font-semibold text-[#1F2937] flex items-center gap-2"><Building2 className="w-5 h-5 text-[#0E6BA8]" /> Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input className="input-field" value={form.name} onChange={e => onChange("name", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" className="input-field pl-9" value={form.email} onChange={e => onChange("email", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input-field pl-9" value={form.phone || ""} onChange={e => onChange("phone", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="url" className="input-field pl-9" placeholder="https://example.com" value={form.website || ""} onChange={e => onChange("website", e.target.value)} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Address */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-hover p-6 space-y-4">
              <h2 className="text-xl font-semibold text-[#1F2937] flex items-center gap-2"><MapPin className="w-5 h-5 text-[#0E6BA8]" /> Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Address Line 1</label>
                  <input className="input-field" value={form.addressLine1} onChange={e => onChange("addressLine1", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Address Line 2</label>
                  <input className="input-field" value={form.addressLine2 || ""} onChange={e => onChange("addressLine2", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">City</label>
                  <input className="input-field" value={form.city} onChange={e => onChange("city", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">State</label>
                  <input className="input-field" value={form.state || ""} onChange={e => onChange("state", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Country</label>
                  <input className="input-field" value={form.country} onChange={e => onChange("country", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">ZIP</label>
                  <input className="input-field" value={form.zip || ""} onChange={e => onChange("zip", e.target.value)} />
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-hover p-6 space-y-4">
              <h2 className="text-xl font-semibold text-[#1F2937]">About Clinic</h2>
              <textarea className="input-field min-h-28" value={form.description || ""} onChange={e => onChange("description", e.target.value)} />
            </motion.div>

            <div className="flex gap-3">
              <button onClick={onSave} disabled={saving} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={onReset} disabled={saving} className="btn-secondary flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicInfoPage;


