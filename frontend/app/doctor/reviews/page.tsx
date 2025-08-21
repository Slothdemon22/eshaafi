'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Star,
  MessageSquare,
  Calendar,
  User,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import Link from 'next/link';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config';

interface Review {
  id: number;
  patientName: string;
  patientEmail: string;
  behaviourRating: number;
  recommendationRating: number;
  reviewText?: string;
  createdAt: string;
  appointmentDate: string;
  appointmentReason: string;
}

interface ReviewStats {
  totalReviews: number;
  averageBehaviourRating: number;
  averageRecommendationRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

const DoctorReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageBehaviourRating: 0,
    averageRecommendationRating: 0,
    ratingDistribution: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAuthenticated, isDoctor } = useAuth();
  const { addToast } = useToast();

  const fetchReviews = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [reviewsResponse, summaryResponse] = await Promise.all([
        fetch(buildApiUrl(API_ENDPOINTS.doctorOwnReviews), {
          credentials: 'include'
        }),
        fetch(buildApiUrl(API_ENDPOINTS.doctorOwnReviewSummary), {
          credentials: 'include'
        })
      ]);

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        const transformedReviews: Review[] = reviewsData.reviews.map((review: any) => ({
          id: review.id,
          patientName: review.patient?.name || 'Anonymous Patient',
          patientEmail: review.patient?.email || 'No email',
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

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setStats({
          totalReviews: summaryData.count || 0,
          averageBehaviourRating: summaryData.avgBehaviour || 0,
          averageRecommendationRating: summaryData.avgRecommendation || 0,
          ratingDistribution: summaryData.ratingDistribution || {}
        });
      }

      if (isRefresh) {
        addToast({
          type: 'success',
          title: 'Data Refreshed',
          message: 'Reviews data has been updated successfully.',
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      addToast({
        type: 'error',
        title: 'Failed to Load Reviews',
        message: 'Unable to fetch your reviews. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isDoctor) {
      fetchReviews();
    }
  }, [isAuthenticated, isDoctor]);

  const filteredReviews = reviews.filter(review => {
    const matchesFilter = filter === 'all' || 
      review.behaviourRating === parseInt(filter) || 
      review.recommendationRating === parseInt(filter);
    const matchesSearch = review.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (review.reviewText && review.reviewText.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elevated">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#1F2937] mb-4 heading-font">Authentication Required</h2>
          <p className="text-[#4B5563] mb-8 text-lg">Please log in to view your reviews.</p>
          <Link href="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!isDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-[#1F2937] mb-4 heading-font">Access Denied</h2>
          <p className="text-[#4B5563] mb-8 text-lg">Only doctors can access this page.</p>
          <Link href="/" className="btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/doctor/dashboard" className="inline-flex items-center space-x-2 text-[#0E6BA8] hover:text-[#0B5A8A] mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-3 heading-font">
                My Reviews
              </h1>
              <p className="text-xl text-[#4B5563]">
                Patient feedback and ratings for your practice
              </p>
            </div>
            <button
              onClick={() => fetchReviews(true)}
              disabled={isRefreshing}
              className="btn-secondary mt-6 md:mt-0 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Behaviour Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageBehaviourRating > 0 ? stats.averageBehaviourRating.toFixed(1) : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recommendation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRecommendationRating > 0 ? stats.averageRecommendationRating.toFixed(1) : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overall Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageBehaviourRating > 0 && stats.averageRecommendationRating > 0 
                    ? ((stats.averageBehaviourRating + stats.averageRecommendationRating) / 2).toFixed(1)
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-hover mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#4B5563]" />
                <span className="text-sm font-semibold text-[#1F2937]">Filter:</span>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="input-field w-auto"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12 w-full md:w-64"
              />
            </div>
          </div>
        </motion.div>

        {/* Reviews List */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-[#4B5563] font-medium">Loading your reviews...</p>
            </div>
          </motion.div>
        ) : stats.totalReviews === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-hover text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-[#1F2937] mb-3 heading-font">No Reviews Yet</h3>
            <p className="text-[#4B5563] mb-8 text-lg">
              You haven't received any reviews yet. Reviews will appear here once patients rate their completed appointments.
            </p>
          </motion.div>
        ) : filteredReviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-hover text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-[#1F2937] mb-3 heading-font">No Reviews Found</h3>
            <p className="text-[#4B5563] mb-8 text-lg">
              No reviews match your current filter criteria.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-hover"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[#1F2937] mb-1">
                          {review.patientName}
                        </h3>
                        <p className="text-[#4B5563] text-sm">{review.patientEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#6B7280]">{review.createdAt}</p>
                        <p className="text-xs text-[#9CA3AF]">Review Date</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <ThumbsUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563] font-medium">Behaviour & Communication</p>
                          <div className="flex items-center space-x-2">
                            {renderStars(review.behaviourRating, 'sm')}
                            <span className="text-sm font-semibold text-[#1F2937]">
                              {review.behaviourRating}/5
                            </span>
                            <span className="text-xs text-[#6B7280]">
                              ({getRatingLabel(review.behaviourRating)})
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563] font-medium">Recommendation</p>
                          <div className="flex items-center space-x-2">
                            {renderStars(review.recommendationRating, 'sm')}
                            <span className="text-sm font-semibold text-[#1F2937]">
                              {review.recommendationRating}/5
                            </span>
                            <span className="text-xs text-[#6B7280]">
                              ({getRatingLabel(review.recommendationRating)})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {review.reviewText && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <p className="text-[#1F2937] italic">"{review.reviewText}"</p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-[#6B7280]">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Appointment: {review.appointmentDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Reason: {review.appointmentReason}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorReviewsPage;
