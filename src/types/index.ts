// Core types for the application

// Re-export ThemeColors from themeLoader for convenience
export type { ThemeColors } from '@/utils/themeLoader';

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

export type ViewMode = 'prompt' | 'ops' | 'settings' | 'help' | 'queue' | 'pit';

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
  data?: unknown;
}

export interface MessageResponse<T = unknown> {
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

export interface PitState {
  selectedPostId: string | null;
  manualMode: boolean;
  manualPrompt: string;
  selectedPack: string;
  selectedPromptIndex: number;
  tries: number;
  stopOnFirstSuccess: boolean;
}

// Job Queue System Types
export type JobType =
  | 'process-for-upscale'
  | 'upscale'
  | 'download'
  | 'unlike'
  | 'relike'
  | 'purge-liked'
  | 'purge-archive'
  | 'purge-packs';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number; // 0-100
  totalItems: number;
  processedItems: number;
  createdAt: number;
  error?: string;
  data: JobData;
}

export type JobData =
  | ProcessForUpscaleJobData
  | UpscaleJobData
  | DownloadJobData
  | UnlikeJobData
  | RelikeJobData
  | PurgeJobData;

export interface ProcessForUpscaleJobData {
  type: 'process-for-upscale';
  postIds: string[];
}

export interface UpscaleJobData {
  type: 'upscale';
  postIds: string[];
  videoIds: string[];
  hdUrlMap?: Record<string, string>; // videoId -> hdUrl mapping
}

export interface DownloadJobData {
  type: 'download';
  postIds: string[];
  items: Array<{ url: string; filename: string; status?: 'pending' | 'completed' | 'failed' }>;
}

export interface UnlikeJobData {
  type: 'unlike';
  postIds: string[];
  posts: LikedPost[];
}

export interface RelikeJobData {
  type: 'relike';
  postIds: string[];
}

export interface PurgeJobData {
  type: 'purge-liked' | 'purge-archive' | 'purge-packs';
  category: 'liked-posts' | 'unliked-archive' | 'prompt-packs';
}
