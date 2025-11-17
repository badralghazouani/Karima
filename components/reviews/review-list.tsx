'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ReviewCard } from './review-card';
import { ReviewForm } from './review-form';
import { StarRating } from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ReviewListProps {
  courseId: string;
  isEnrolled?: boolean;
}

export function ReviewList({ courseId, isEnrolled }: ReviewListProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    fetchReviews();
  };

  const userReview = reviews.find((r) => r.user.id === session?.user?.id);
  const canReview = isEnrolled && !userReview && !showForm && !editingReview;

  if (isLoading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      {stats && stats.totalReviews > 0 && (
        <Card className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="text-4xl font-bold mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <StarRating
                rating={Math.round(stats.averageRating)}
                readonly
                size="lg"
                showCount
                count={stats.totalReviews}
              />
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution];
                const percentage =
                  stats.totalReviews > 0
                    ? (count / stats.totalReviews) * 100
                    : 0;

                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-12">{star} star</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Review Form */}
      {canReview && (
        <Button onClick={() => setShowForm(true)}>Write a Review</Button>
      )}

      {showForm && !editingReview && (
        <ReviewForm
          courseId={courseId}
          onSuccess={handleFormSuccess}
        />
      )}

      {editingReview && (
        <ReviewForm
          courseId={courseId}
          existingReview={editingReview}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Reviews List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          Reviews ({stats?.totalReviews || 0})
        </h3>

        {reviews.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No reviews yet. Be the first to review this course!
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={session?.user?.id}
                onEdit={
                  review.user.id === session?.user?.id
                    ? (r) => setEditingReview(r)
                    : undefined
                }
                onDelete={
                  review.user.id === session?.user?.id
                    ? handleDelete
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
