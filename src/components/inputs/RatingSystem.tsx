/**
 * Star rating component
 */

import React, { useState } from 'react';
import { Icon } from '../common/Icon';
import { mdiStar, mdiStarOutline } from '@mdi/js';

interface RatingSystemProps {
  rating: number;
  onChange: (rating: number) => void;
  readonly?: boolean;
}

export const RatingSystem: React.FC<RatingSystemProps> = ({ rating, onChange, readonly = false }) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={readonly ? 'cursor-default' : 'cursor-pointer transition-colors duration-100'}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHoveredRating(star)}
          onMouseLeave={() => !readonly && setHoveredRating(null)}
          disabled={readonly}
        >
          <Icon
            path={displayRating >= star ? mdiStar : mdiStarOutline}
            size={1}
            color="var(--color-text-primary)"
          />
        </button>
      ))}
    </div>
  );
};
