// Core types for the application

export interface PromptItem {
  text: string;
  rating: number; // 0-5 stars
}

export interface Packs {
  [packName: string]: PromptItem[];
}

export interface AppState {
  packs: Packs;
  currentPack: string;
  currentIndex: number;
}

export interface MediaUrl {
  url: string;
  type: 'image' | 'video';
  isHD?: boolean;
  id?: string;
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

export type ViewMode = 'prompt' | 'ops' | 'settings' | 'help' | 'queue';

export type QueueItemStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface QueueItem {
  postId: string;
  videoId: string;
  status: QueueItemStatus;
  hdUrl?: string;
  addedAt: number;
}

export interface MessagePayload {
  type: 'FETCH_POST' | 'UPSCALE_VIDEO' | 'DOWNLOAD_MEDIA' | 'GET_STORAGE' | 'SET_STORAGE';
  data?: any;
}

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LikedPost {
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
  resolution?: {
    width: number;
    height: number;
  };
  modelName?: string;
  thumbnailImageUrl?: string;
}

export interface LikedPostsResponse {
  posts: LikedPost[];
}
