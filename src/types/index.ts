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

export interface ChildPost {
  id: string;
  userId: string;
  createTime: string;
  prompt: string;
  mediaType: string;
  mediaUrl: string;
  mimeType: string;
  originalPostId?: string;
  audioUrls: string[];
  childPosts: ChildPost[];
  originalPrompt?: string;
  mode?: string;
  resolution?: {
    width: number;
    height: number;
  };
  modelName?: string;
  thumbnailImageUrl?: string;
  hdMediaUrl?: string;
}

export interface PostData {
  post: {
    id: string;
    userId: string;
    createTime: string;
    prompt: string;
    mediaType: string;
    mediaUrl: string;
    mimeType: string;
    audioUrls: string[];
    childPosts: ChildPost[];
    originalPrompt?: string;
    mode?: string;
  };
}

export type ViewMode = 'prompt' | 'ops' | 'settings';

export interface MessagePayload {
  type: 'FETCH_POST' | 'UPSCALE_VIDEO' | 'DOWNLOAD_MEDIA' | 'GET_STORAGE' | 'SET_STORAGE';
  data?: any;
}

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
