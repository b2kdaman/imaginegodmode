/**
 * Reusable post grid component for bulk operation modals
 */

import React from 'react';
import { ThemeColors } from '@/types';
import { Icon } from '@/components/common/Icon';
import { mdiFilmstripBoxMultiple } from '@mdi/js';

export interface PostGridItem {
  id: string;
  thumbnailImageUrl?: string;
  mediaUrl: string;
  prompt?: string | null;
  videoCount?: number;
}

interface PostGridProps {
  posts: PostGridItem[];
  selectedIds: Set<string>;
  isProcessing: boolean;
  onItemClick: (postId: string, e: React.MouseEvent) => void;
  renderOverlay: (post: PostGridItem, isSelected: boolean) => React.ReactNode;
  renderBadges?: (post: PostGridItem) => React.ReactNode;
  getBorderColor: (isSelected: boolean) => string;
  colors: ThemeColors;
}

export const PostGrid: React.FC<PostGridProps> = ({
  posts,
  selectedIds,
  isProcessing,
  onItemClick,
  renderOverlay,
  renderBadges,
  getBorderColor,
  colors,
}) => {
  return (
    <div className="flex-1 overflow-y-scroll mb-3">
      <div className="grid grid-cols-5 gap-2">
        {posts.map((post) => {
          const isSelected = selectedIds.has(post.id);
          const imageUrl = post.thumbnailImageUrl || post.mediaUrl;

          return (
            <div
              key={post.id}
              className="relative aspect-square rounded-lg overflow-hidden transition-all cursor-pointer"
              style={{
                border: `2px solid ${getBorderColor(isSelected)}`,
                opacity: isProcessing ? 0.7 : (isSelected ? 1 : 0.6),
                pointerEvents: isProcessing ? 'none' : 'auto',
              }}
              onClick={(e) => onItemClick(post.id, e)}
              onMouseEnter={(e) => {
                if (!isSelected && !isProcessing) {
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isProcessing) {
                  e.currentTarget.style.opacity = '0.6';
                }
              }}
            >
              {/* Image */}
              <img
                src={imageUrl}
                alt={post.prompt || 'Post'}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Custom Overlay */}
              {renderOverlay(post, isSelected)}

              {/* Video Count Badge */}
              {post.videoCount !== undefined && post.videoCount > 0 && (
                <div
                  className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center gap-0.5"
                  style={{
                    backgroundColor: colors.BACKGROUND_DARK,
                    color: colors.TEXT_PRIMARY,
                    opacity: 0.9,
                  }}
                >
                  <Icon path={mdiFilmstripBoxMultiple} size={0.5} />
                  {post.videoCount}
                </div>
              )}

              {/* Custom Badges */}
              {renderBadges?.(post)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
