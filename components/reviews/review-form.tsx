'use client';

import { useState } from 'react';
import { StarRating } from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

interface ReviewFormProps {
  courseId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  };
  onSuccess?: () => void;
}

export function ReviewForm({
  courseId,
  existingReview,
  onSuccess,
}: ReviewFormProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError(t('reviews.selectRating'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const url = existingReview
        ? `/api/reviews/${existingReview.id}`
        : '/api/reviews';
      const method = existingReview ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          rating,
          comment: comment || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('reviews.failedToSubmit'));
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('reviews.failedToSubmit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {existingReview ? t('reviews.editReview') : t('reviews.writeReview')}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('reviews.yourRating')} *
          </label>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size="lg"
          />
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            {t('reviews.yourReviewOptional')}
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('reviews.reviewPlaceholder')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t('reviews.submitting')
              : existingReview
              ? t('reviews.updateReview')
              : t('reviews.submitReview')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
