/**
 * Zustand store for media management
 */

import { create } from 'zustand';
import { MediaUrl } from '@/types';

interface MediaStore {
  // State
  urls: MediaUrl[];
  videoIdsToUpscale: string[];
  upscaleProgress: number;
  isUpscaling: boolean;
  hdVideoCount: number;
  statusText: string;
  isSpinning: boolean;

  // Actions
  setMediaUrls: (urls: MediaUrl[]) => void;
  setVideoIdsToUpscale: (ids: string[]) => void;
  setUpscaleProgress: (progress: number) => void;
  setIsUpscaling: (isUpscaling: boolean) => void;
  setHdVideoCount: (count: number) => void;
  setStatusText: (text: string) => void;
  setIsSpinning: (isSpinning: boolean) => void;
  reset: () => void;
}

const initialState = {
  urls: [],
  videoIdsToUpscale: [],
  upscaleProgress: 0,
  isUpscaling: false,
  hdVideoCount: 0,
  statusText: 'Ready',
  isSpinning: false,
};

export const useMediaStore = create<MediaStore>((set) => ({
  ...initialState,

  setMediaUrls: (urls) => set({ urls }),
  setVideoIdsToUpscale: (ids) => set({ videoIdsToUpscale: ids }),
  setUpscaleProgress: (progress) => set({ upscaleProgress: progress }),
  setIsUpscaling: (isUpscaling) => set({ isUpscaling }),
  setHdVideoCount: (count) => set({ hdVideoCount: count }),
  setStatusText: (text) => set({ statusText: text }),
  setIsSpinning: (isSpinning) => set({ isSpinning }),
  reset: () => set(initialState),
}));
