"use client";

import React, { useEffect, useState } from "react";
import { Stethoscope, Mail, MapPin, Loader2, Search, Filter, Calendar } from "lucide-react";
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toaster";

interface Doctor {
  id: number;
  name: string;
  email: string;
  specialty: string;
  location: string;
  availability?: any[];
}

interface Speciality {
  value: string;
  label: string;
}

const PublicDoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>("");
  const [specialityDropdown, setSpecialityDropdown] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(buildApiUrl(API_ENDPOINTS.allDoctors))
      .then(res => res.json())
      .then(data => setDoctors(data.doctors || []))
      .catch(() => setError("Failed to fetch doctors"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch(buildApiUrl(API_ENDPOINTS.doctorSpecialities))
      .then(res => res.json())
      .then(setSpecialities)
      .catch(() => setSpecialities([]));
  }, []);

  useEffect(() => {
    let filtered = doctors;
    if (search.trim()) {
      filtered = filtered.filter(d => d.name.toLowerCase().includes(search.trim().toLowerCase()));
    }
    if (selectedSpeciality) {
      filtered = filtered.filter(d => d.specialty === selectedSpeciality);
    }
    setFilteredDoctors(filtered);
  }, [doctors, search, selectedSpeciality]);

  const handleBook = (doctor: Doctor) => {
    if (isAuthenticated) {
      // Optionally pass doctor id as query param
      router.push(`/book-appointment?doctorId=${doctor.id}`);
    } else {
      addToast({
        type: "info",
        title: "Login Required",
        message: "Please login to book an appointment."
      });
    }
  };

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl font-bold text-[#0E6BA8] mb-2 flex items-center justify-center gap-2">
            <Stethoscope className="w-8 h-8 text-[#1CA7A6]" />
            Our Doctors
          </h1>
          <p className="text-lg text-gray-600">Meet our team of expert, verified doctors ready to help you.</p>
        </motion.div>

        {/* Filters/Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 w-full"
                aria-label="Search doctors by name"
              />
            </div>
            <div className="relative w-full md:w-64">
              <button
                className="input-field flex items-center w-full justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0E6BA8]"
                onClick={() => setSpecialityDropdown(v => !v)}
                aria-haspopup="listbox"
                aria-expanded={specialityDropdown}
                type="button"
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  {selectedSpeciality
                    ? specialities.find(s => s.value === selectedSpeciality)?.label || "Speciality"
                    : "Speciality"}
                </span>
                <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {specialityDropdown && (
                <ul
                  className="absolute z-10 left-0 right-0 glass-effect border border-[#0E6BA8]/30 shadow-lg rounded-xl max-h-60 overflow-y-auto mt-1 backdrop-blur-md"
                  tabIndex={-1}
                  role="listbox"
                >
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-[#E0F2FE] transition-colors rounded-t-xl ${selectedSpeciality === "" ? "font-semibold bg-[#E0F2FE]" : ""}`}
                    onClick={() => { setSelectedSpeciality(""); setSpecialityDropdown(false); }}
                    role="option"
                    aria-selected={selectedSpeciality === ""}
                  >
                    All Specialities
                  </li>
                  {specialities.map(s => (
                    <li
                      key={s.value}
                      className={`px-4 py-2 cursor-pointer hover:bg-[#E0F2FE] transition-colors ${selectedSpeciality === s.value ? "font-semibold bg-[#E0F2FE]" : ""}`}
                      onClick={() => { setSelectedSpeciality(s.value); setSpecialityDropdown(false); }}
                      role="option"
                      aria-selected={selectedSpeciality === s.value}
                    >
                      {s.label}
                    </li>
                  ))}
                  {specialities.length === 0 && (
                    <li className="px-4 py-2 text-gray-400">No specialities found</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </motion.div>

        {/* Doctor Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0E6BA8]" />
            <span className="ml-4 text-lg text-gray-600">Loading doctors...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-10">{error}</div>
        ) : filteredDoctors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Doctors Found</h3>
            <p className="text-gray-600 mb-6">
              {search || selectedSpeciality
                ? "No doctors match your search or filter."
                : "No doctors available at the moment."}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card card-hover animate-fade-in-up flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Stethoscope className="w-6 h-6 text-[#1CA7A6]" />
                    <h2 className="text-xl font-semibold text-[#0E6BA8]">{doctor.name}</h2>
                  </div>
                  <div className="text-gray-700 mb-1 font-medium">
                    {specialities.find(s => s.value === doctor.specialty)?.label || doctor.specialty}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {doctor.location || "-"}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Mail className="w-4 h-4 mr-1" />
                    {doctor.email}
                  </div>
                </div>
                <button
                  className="btn-primary mt-4 flex items-center justify-center gap-2 w-full"
                  onClick={() => handleBook(doctor)}
                  aria-label={`Book appointment with ${doctor.name}`}
                >
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDoctorsPage;
