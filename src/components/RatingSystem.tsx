/**
 * Star rating component
 */

import React, { useState } from 'react';
import { Icon } from './Icon';
import { mdiStar, mdiStarOutline } from '@mdi/js';

interface RatingSystemProps {
  rating: number;
  onChange: (rating: number) => void;
}

export const RatingSystem: React.FC<RatingSystemProps> = ({ rating, onChange }) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="cursor-pointer transition-colors duration-100"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(null)}
        >
          <Icon
            path={displayRating >= star ? mdiStar : mdiStarOutline}
            size={1}
            color={displayRating >= star ? '#FFD700' : '#666'}
          />
        </button>
      ))}
    </div>
  );
};
