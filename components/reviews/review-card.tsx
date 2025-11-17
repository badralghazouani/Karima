'use client';

import { StarRating } from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      avatar: string | null;
    };
  };
  currentUserId?: string;
  onEdit?: (review: any) => void;
  onDelete?: (reviewId: string) => void;
}

export function ReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const isOwnReview = currentUserId === review.user.id;

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {review.user.avatar ? (
            <img
              src={review.user.avatar}
              alt={review.user.name || 'User'}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {(review.user.name || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold">
                {review.user.name || 'Anonymous'}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} readonly size="sm" />
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            {/* Actions for own review */}
            {isOwnReview && (onEdit || onDelete) && (
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(review)}
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(review.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Review comment */}
          {review.comment && (
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
