// Core types for the application

export interface PromptItem {
  text: string;
  rating: number; // 0-5 stars
}

export interface Categories {
  [categoryName: string]: PromptItem[];
}

export interface AppState {
  categories: Categories;
  currentCategory: string;
  currentIndex: number;
}

export interface MediaUrl {
  url: string;
  type: 'image' | 'video';
  isHD?: boolean;
}

export interface MediaState {
  urls: MediaUrl[];
  videoIdsToUpscale: string[];
  upscaleProgress: number; // 0-100
  isUpscaling: boolean;
  hdVideoCount: number;
}

export interface PostData {
  id: string;
  media?: Array<{
    url?: string;
    hdUrl?: string;
    videoId?: string;
    type: string;
  }>;
}

export type ViewMode = 'prompt' | 'status';

export interface MessagePayload {
  type: 'FETCH_POST' | 'UPSCALE_VIDEO' | 'DOWNLOAD_MEDIA' | 'GET_STORAGE' | 'SET_STORAGE';
  data?: any;
}

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
