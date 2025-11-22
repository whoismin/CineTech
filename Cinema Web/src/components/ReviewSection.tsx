import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Star, ThumbsUp, User } from "lucide-react";
import { Review } from "../types";
import { useState } from "react";
import { Separator } from "./ui/separator";

interface ReviewSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onAddReview: (rating: number, comment: string) => void;
}

export function ReviewSection({ reviews, averageRating, totalReviews, onAddReview }: ReviewSectionProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = () => {
    if (rating > 0 && comment.trim()) {
      onAddReview(rating, comment);
      setRating(0);
      setComment("");
      setIsWriting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl mb-2">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{totalReviews} reviews</p>
          </div>
          <Separator orientation="vertical" className="h-24" />
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter(r => Math.round(r.rating) === stars).length;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2 mb-2">
                  <span className="text-sm w-6">{stars}★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Write Review */}
      {!isWriting ? (
        <Button onClick={() => setIsWriting(true)} className="w-full">
          Write a Review
        </Button>
      ) : (
        <Card className="p-6">
          <h3 className="mb-4">Write Your Review</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-2">Your Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoveredStar || rating)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm mb-2">Your Comment</p>
              <Textarea
                placeholder="Share your thoughts about the movie..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={rating === 0 || !comment.trim()}>
                Submit Review
              </Button>
              <Button variant="outline" onClick={() => setIsWriting(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3>User Reviews</h3>
        {reviews.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p>{review.userName}</p>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      {review.rating}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{review.comment}</p>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.likes})
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
