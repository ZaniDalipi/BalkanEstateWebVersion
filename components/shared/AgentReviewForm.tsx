import React, { useState } from 'react';
import { addAgentReview } from '../../services/apiService';
import { StarIcon } from '../../constants';

interface AgentReviewFormProps {
  agentId: string;
  agentName: string;
  onReviewSubmitted: () => void;
}

const AgentReviewForm: React.FC<AgentReviewFormProps> = ({ agentId, agentName, onReviewSubmitted }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [quote, setQuote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quote.trim()) {
      setError('Please write a review');
      return;
    }

    if (quote.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addAgentReview(agentId, { quote: quote.trim(), rating });
      setSuccess(true);
      setQuote('');
      setRating(5);

      // Call the callback after a short delay to show success message
      setTimeout(() => {
        onReviewSubmitted();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-5xl mb-3">✓</div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Review Submitted!</h3>
        <p className="text-green-700">Thank you for sharing your experience with {agentName}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-bold text-neutral-800 mb-4">Write a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Your Rating
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <StarIcon
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-neutral-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-lg font-semibold text-neutral-700">
              {rating} {rating === 1 ? 'star' : 'stars'}
            </span>
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="review-text" className="block text-sm font-semibold text-neutral-700 mb-2">
            Your Review
          </label>
          <textarea
            id="review-text"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder={`Share your experience working with ${agentName}...`}
            rows={4}
            className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            disabled={isSubmitting}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Minimum 10 characters ({quote.length}/10)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !quote.trim()}
          className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </button>
      </form>

      <p className="text-xs text-neutral-500 mt-4 text-center">
        Your review will be publicly visible and associated with your account.
      </p>
    </div>
  );
};

export default AgentReviewForm;
