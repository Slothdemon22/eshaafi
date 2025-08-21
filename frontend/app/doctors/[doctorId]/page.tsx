"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config";
import { Stethoscope, Mail, MapPin, Calendar, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface EducationEntry {
  degree: string;
  institution: string;
  year?: string;
}

interface WorkExperienceEntry {
  title: string;
  organization: string;
  years?: string;
}

interface DoctorDetails {
  id: number;
  name: string;
  email: string;
  specialty: string;
  location: string;
  education: EducationEntry[];
  workExperience: WorkExperienceEntry[];
  online?: boolean;
}

interface Review {
  id: number;
  patientName: string;
  behaviourRating: number;
  recommendationRating: number;
  reviewText?: string;
  createdAt: string;
  appointmentDate: string;
  appointmentReason: string;
}

const DoctorProfilePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const doctorId = params?.doctorId as string;
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewSummary, setReviewSummary] = useState<{ count: number; avgBehaviour: number | null; avgRecommendation: number | null } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    const fetchDetails = async () => {
      try {
        const [profileRes, summaryRes, reviewsRes] = await Promise.all([
          fetch(buildApiUrl(API_ENDPOINTS.getDoctorById(doctorId))),
          fetch(buildApiUrl(API_ENDPOINTS.doctorReviewSummary(doctorId))),
          fetch(buildApiUrl(API_ENDPOINTS.doctorReviews(doctorId)))
        ]);

        if (!profileRes.ok) {
          throw new Error("Failed to fetch doctor details");
        }
        const profile = await profileRes.json();
        console.log('Doctor profile data:', profile); // Debug log
        setDoctor(profile);

        if (summaryRes.ok) {
          const summary = await summaryRes.json();
          setReviewSummary(summary);
        }

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          const transformedReviews: Review[] = reviewsData.reviews.map((review: any) => ({
            id: review.id,
            patientName: review.patient?.name || 'Anonymous Patient',
            behaviourRating: review.behaviourRating,
            recommendationRating: review.recommendationRating,
            reviewText: review.reviewText,
            createdAt: new Date(review.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            appointmentDate: review.appointment ? new Date(review.appointment.dateTime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Unknown',
            appointmentReason: review.appointment?.reason || 'No reason provided'
          }));
          setReviews(transformedReviews);
        }
      } catch (e: any) {
        setError(e.message || "Failed to load doctor details");
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };
    fetchDetails();
  }, [doctorId]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="card p-8 text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="card p-8 text-center text-red-600">{error || "Doctor not found"}</div>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5: return 'Excellent';
      case 4: return 'Very Good';
      case 3: return 'Good';
      case 2: return 'Fair';
      case 1: return 'Poor';
      default: return 'Not Rated';
    }
  };

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            className="text-[#0E6BA8] hover:underline flex items-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Stethoscope className="w-8 h-8 text-[#1CA7A6]" />
            <div>
              <h1 className="text-3xl font-bold text-[#0E6BA8]">{doctor.name}</h1>
              <div className="text-xl text-gray-700 font-medium">{doctor.specialty}</div>
            </div>
            {typeof doctor.online === 'boolean' && (
              <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${doctor.online ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {doctor.online ? '🟢 Online' : '🔴 Offline'}
              </span>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2 text-[#1CA7A6]" />
              <span>{doctor.location || 'Location not specified'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-2 text-[#1CA7A6]" />
              <span>{doctor.email}</span>
            </div>
          </div>

          {doctor.clinic && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-semibold text-blue-800">Affiliated Clinic</span>
              </div>
              <div className="text-blue-700">{doctor.clinic.name}</div>
            </div>
          )}

          {reviewSummary && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="font-semibold text-gray-800">Patient Reviews</span>
              </div>
              <div className="text-gray-700">
                <span className="font-medium">{reviewSummary.count}</span> total reviews
                {reviewSummary.count > 0 && (
                  <div className="mt-1 text-sm">
                    <span>Behaviour: <span className="font-medium">{reviewSummary.avgBehaviour?.toFixed(1) ?? '-'}</span> / 5</span>
                    <span className="mx-2">•</span>
                    <span>Recommendation: <span className="font-medium">{reviewSummary.avgRecommendation?.toFixed(1) ?? '-'}</span> / 5</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Doctor Status */}
        {typeof doctor.active === 'boolean' && !doctor.active && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6 bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-semibold">Currently Not Available</span>
            </div>
            <p className="text-red-700 mt-1">This doctor is currently not accepting new appointments.</p>
          </motion.div>
        )}

        {/* Booking Section - Moved to upper side */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Ready to Book an Appointment?</h3>
            <p className="text-gray-600 mb-6">Schedule a consultation with Dr. {doctor.name} today.</p>
            <Link 
              href={`/book-appointment?doctorId=${doctor.id}`} 
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                doctor.active === false 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#0E6BA8] hover:bg-[#0B5A8A] hover:scale-105'
              }`}
              onClick={(e) => {
                if (doctor.active === false) {
                  e.preventDefault();
                }
              }}
            >
              <Calendar className="w-5 h-5" /> 
              {doctor.active === false ? 'Not Available' : 'Book Appointment'}
            </Link>
          </div>
        </motion.div>

        {/* Education Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            Education
          </h2>
          {doctor.education && Array.isArray(doctor.education) && doctor.education.length > 0 ? (
            <div className="space-y-3">
              {doctor.education.map((edu, idx) => (
                <div key={idx} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="font-semibold text-gray-800">{edu.degree || 'Degree'}</div>
                  <div className="text-gray-600">{edu.institution || 'Institution'}</div>
                  {edu.year && <div className="text-sm text-gray-500">{edu.year}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No education information available</p>
          )}
        </motion.div>

        {/* Work Experience Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            Work Experience
          </h2>
          {doctor.workExperience && Array.isArray(doctor.workExperience) && doctor.workExperience.length > 0 ? (
            <div className="space-y-3">
              {doctor.workExperience.map((exp, idx) => (
                <div key={idx} className="border-l-4 border-green-200 pl-4 py-2">
                  <div className="font-semibold text-gray-800">{exp.title || 'Position'}</div>
                  <div className="text-gray-600">{exp.organization || 'Organization'}</div>
                  {exp.years && <div className="text-sm text-gray-500">{exp.years}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No work experience information available</p>
          )}
        </motion.div>

        {/* Reviews Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Patient Reviews
          </h2>
          
          {reviewSummary && reviewSummary.count > 0 ? (
            <div className="space-y-6">
              {/* Overall Rating Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Overall Rating</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {((reviewSummary.avgBehaviour + reviewSummary.avgRecommendation) / 2).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">out of 5</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round((reviewSummary.avgBehaviour + reviewSummary.avgRecommendation) / 2)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    Based on {reviewSummary.count} review{reviewSummary.count === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {/* Rating Breakdown */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Behaviour & Communication</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(reviewSummary.avgBehaviour)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {reviewSummary.avgBehaviour.toFixed(1)}/5
                    </span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Recommendation</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(reviewSummary.avgRecommendation)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {reviewSummary.avgRecommendation.toFixed(1)}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500">This doctor hasn't received any reviews yet.</p>
            </div>
          )}
        </motion.div>

        {/* Individual Reviews Section */}
        {reviewSummary && reviewSummary.count > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Patient Reviews ({reviews.length})
            </h2>
            
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="spinner mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading reviews...</p>
                </div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Available</h3>
                <p className="text-gray-500">No detailed reviews are available for this doctor.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                              {review.patientName}
                            </h3>
                            <p className="text-sm text-gray-500">Reviewed on {review.createdAt}</p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Behaviour & Communication</p>
                              <div className="flex items-center space-x-2">
                                {renderStars(review.behaviourRating, 'sm')}
                                <span className="text-sm font-semibold text-gray-700">
                                  {review.behaviourRating}/5
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({getRatingLabel(review.behaviourRating)})
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Recommendation</p>
                              <div className="flex items-center space-x-2">
                                {renderStars(review.recommendationRating, 'sm')}
                                <span className="text-sm font-semibold text-gray-700">
                                  {review.recommendationRating}/5
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({getRatingLabel(review.recommendationRating)})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {review.reviewText && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-700 italic">"{review.reviewText}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}


      </div>
    </div>
  );
};

export default DoctorProfilePage;


