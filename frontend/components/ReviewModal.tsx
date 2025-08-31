'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send } from 'lucide-react';
import { useToast } from '@/components/ui/Toaster';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number;
  doctorName: string;
  appointmentId: number;
  onReviewSubmitted: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  appointmentId,
  onReviewSubmitted
}) => {
  const [behaviourRating, setBehaviourRating] = useState(0);
  const [recommendationRating, setRecommendationRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (behaviourRating === 0 || recommendationRating === 0) {
      addToast({
        type: 'error',
        title: 'Rating Required',
        message: 'Please provide ratings for both behaviour and recommendation.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.createReview(doctorId)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          appointmentId,
          behaviourRating,
          recommendationRating,
          reviewText: reviewText.trim() || undefined
        }),
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Review Submitted',
          message: 'Thank you for your review!',
        });
        onReviewSubmitted();
        onClose();
        // Reset form
        setBehaviourRating(0);
        setRecommendationRating(0);
        setReviewText('');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Review Submission Failed',
        message: error.message || 'Failed to submit review. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, onRatingChange: (rating: number) => void, label: string) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#1F2937]">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none hover:scale-110 transition-transform"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-xs text-[#6B7280]">
        {rating === 0 && 'Click to rate'}
        {rating === 1 && 'Poor'}
        {rating === 2 && 'Fair'}
        {rating === 3 && 'Good'}
        {rating === 4 && 'Very Good'}
        {rating === 5 && 'Excellent'}
      </p>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto card"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#0E6BA8]">Rate Your Experience</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-[#0E6BA8] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-[#1F2937] mb-2">
                  Dr. {doctorName}
                </h3>
                <p className="text-sm text-[#4B5563]">
                  How was your appointment experience?
                </p>
              </div>

              {/* Behaviour Rating */}
              {renderStars(
                behaviourRating,
                setBehaviourRating,
                'Doctor\'s Behaviour & Communication'
              )}

              {/* Recommendation Rating */}
              {renderStars(
                recommendationRating,
                setRecommendationRating,
                'Would you recommend this doctor?'
              )}

              {/* Review Text */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1F2937]">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this doctor..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E6BA8] focus:border-transparent resize-none input-field"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-[#6B7280] text-right">
                  {reviewText.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-[#4B5563] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || behaviourRating === 0 || recommendationRating === 0}
                  className="flex-1 px-4 py-2 bg-[#0E6BA8] text-white rounded-lg hover:bg-[#0B5A8A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
