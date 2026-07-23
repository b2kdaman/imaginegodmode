/**
 * Select media from the current Grok container before downloading.
 */

import React, { useMemo, useState } from 'react';
import { mdiCheckCircle, mdiDownload, mdiImage, mdiVideo } from '@mdi/js';
import type { MediaUrl, ThemeColors } from '@/types';
import { Button } from '../inputs/Button';
import { Icon } from '../common/Icon';
import { BaseModal } from './BaseModal';
import { SelectionControls } from './shared/SelectionControls';

interface CurrentMediaDownloadModalProps {
  isOpen: boolean;
  media: MediaUrl[];
  onClose: () => void;
  onConfirm: (selectedMedia: MediaUrl[]) => void;
  getThemeColors: () => ThemeColors;
}

interface MediaEntry {
  key: string;
  media: MediaUrl;
}

interface PreviewCandidate {
  url: string;
  type: 'image' | 'video';
}

const normalizePreviewCandidate = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  try {
    const base = /^\/?users\//i.test(value)
      ? 'https://assets.grok.com/'
      : window.location.origin;
    return new URL(value.replace(/^\//, ''), `${base.replace(/\/$/, '')}/`).toString();
  } catch {
    return value;
  }
};

const getGeneratedPreviewUrl = (value: string): string | null => {
  const normalized = normalizePreviewCandidate(value);
  if (!normalized) {
    return null;
  }

  try {
    const url = new URL(normalized);
    const generatedPath = url.pathname.match(/^(.*\/generated\/[^/]+)\/[^/]+$/);
    if (!generatedPath) {
      return null;
    }

    url.pathname = `${generatedPath[1]}/preview_image.jpg`;
    url.searchParams.set('cache', '1');
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
};

const getPreviewCandidates = (item: MediaUrl): PreviewCandidate[] => {
  const candidates: PreviewCandidate[] = [];
  const seen = new Set<string>();
  const add = (value: string | null | undefined, type: PreviewCandidate['type']) => {
    const url = normalizePreviewCandidate(value || undefined);
    if (url && !seen.has(url)) {
      seen.add(url);
      candidates.push({ url, type });
    }
  };

  add(item.previewUrl, 'image');
  add(getGeneratedPreviewUrl(item.url), 'image');
  add(item.url, item.type);
  return candidates;
};

const MediaPreview: React.FC<{ item: MediaUrl; colors: ThemeColors }> = ({ item, colors }) => {
  const candidates = useMemo(
    () => getPreviewCandidates(item),
    [item]
  );
  const [candidateIndex, setCandidateIndex] = useState(0);


  const candidate = candidates[candidateIndex];
  if (!candidate) {
    return (
      <span
        className="flex h-full w-full flex-col items-center justify-center gap-2 text-[11px]"
        style={{ color: colors.TEXT_SECONDARY }}
      >
        <Icon path={item.type === 'video' ? mdiVideo : mdiImage} size={1.1} />
        Preview unavailable
      </span>
    );
  }

  const tryNextCandidate = () => setCandidateIndex((index) => index + 1);

  if (candidate.type === 'video') {
    const videoUrl = candidate.url.includes('#')
      ? candidate.url
      : `${candidate.url}#t=0.001`;
    return (
      <video
        src={videoUrl}
        muted
        playsInline
        preload="metadata"
        onError={tryNextCandidate}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <img
      src={candidate.url}
      alt=""
      loading="lazy"
      draggable={false}
      onError={tryNextCandidate}
      className="h-full w-full object-cover"
    />
  );
};

export const CurrentMediaDownloadModal: React.FC<CurrentMediaDownloadModalProps> = ({
  isOpen,
  media,
  onClose,
  onConfirm,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const entries = useMemo<MediaEntry[]>(
    () => media.map((item, index) => ({
      key: `${item.type}:${item.id || item.url}:${index}`,
      media: item,
    })),
    [media]
  );
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(entries.map((entry) => entry.key))
  );

  const toggleSelection = (key: string) => {
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm(
      entries
        .filter((entry) => selectedKeys.has(entry.key))
        .map((entry) => entry.media)
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      title={`Download media (${selectedKeys.size}/${entries.length})`}
      onClose={onClose}
      getThemeColors={getThemeColors}
      width="90vw"
      maxWidth="full"
      height="85vh"
      maxHeight="800px"
      padding="p-6"
      overlayOpacity={0.7}
      closeOnOverlayClick={true}
      disableClose={false}
      footer={
        <div className="flex gap-2 justify-end">
          <Button onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="text-xs"
            disabled={selectedKeys.size === 0}
            icon={mdiDownload}
          >
            Download {selectedKeys.size} file{selectedKeys.size === 1 ? '' : 's'}
          </Button>
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <SelectionControls
          onSelectAll={() => setSelectedKeys(new Set(entries.map((entry) => entry.key)))}
          onDeselectAll={() => setSelectedKeys(new Set())}
        />

        <div
          className="grid flex-1 content-start justify-start gap-2 overflow-y-auto pr-1"
          style={{ gridTemplateColumns: 'repeat(auto-fill, 150px)' }}
        >
          {entries.map((entry, index) => {
            const item = entry.media;
            const isSelected = selectedKeys.has(entry.key);
            const isVideo = item.type === 'video';

            return (
              <button
                key={entry.key}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${isVideo ? 'Video' : 'Image'} ${index + 1}`}
                onClick={() => toggleSelection(entry.key)}
                className="relative shrink-0 overflow-hidden rounded-lg border-2 transition-all"
                style={{
                  width: '150px',
                  height: '150px',
                  borderColor: isSelected ? colors.SUCCESS : colors.BORDER,
                  opacity: isSelected ? 1 : 0.55,
                  backgroundColor: colors.BACKGROUND_DARK,
                }}
              >
                <MediaPreview item={item} colors={colors} />

                <span
                  className="absolute left-1 top-1 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{ backgroundColor: `${colors.BACKGROUND_DARK}dd`, color: colors.TEXT_PRIMARY }}
                >
                  <Icon path={isVideo ? mdiVideo : mdiImage} size={0.45} />
                  {isVideo ? 'VIDEO' : 'IMAGE'}
                  {isVideo && item.isHD !== undefined ? ` • ${item.isHD ? 'HD' : 'SD'}` : ''}
                </span>

                {isSelected && (
                  <span className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5">
                    <Icon path={mdiCheckCircle} size={0.65} color={colors.SUCCESS} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </BaseModal>
  );
};