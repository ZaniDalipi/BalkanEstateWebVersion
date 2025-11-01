import React from 'react';
// FIX: Correctly import both StarIcon (outline) and StarIconSolid (filled).
import { StarIcon, StarIconSolid } from '../../constants';

interface StarRatingProps {
    rating: number;
    reviewCount?: number;
    size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, reviewCount, size = 'md' }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => (
                    <StarIconSolid key={`full-${i}`} className={`${sizeClasses[size]} text-yellow-400`} />
                ))}
                {/* Note: Half star is complex with SVG, so we'll round for now */}
                {[...Array(emptyStars + (halfStar ? 1 : 0))].map((_, i) => (
                     <StarIcon key={`empty-${i}`} className={`${sizeClasses[size]} text-yellow-400`} />
                ))}
            </div>
            {reviewCount !== undefined && (
                <span className="text-sm text-neutral-500 font-medium">
                    ({reviewCount})
                </span>
            )}
        </div>
    );
};

export default StarRating;
