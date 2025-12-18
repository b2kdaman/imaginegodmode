# Queue System Refactoring Plan

## Overview

This document outlines the plan to refactor the existing queue system from separate upscale/download queues into a unified job-based queue system where batch operations are treated as single jobs with progress tracking.

## Current State Analysis

### Existing Queue Systems

#### 1. Upscale Queue (`useUpscaleQueueStore.ts`)
- **Structure**: Each video is a separate `QueueItem`
- **Processing**: Batches of 15 videos at a time
- **Progress**: Tracked per batch (0-100%)
- **Downloads**: Auto-downloads after upscaling (if enabled)
- **Behavior**: Blocks until batch completes, then downloads

#### 2. Download Queue (`useDownloadQueueStore.ts`)
- **Structure**: Each media file is a separate `DownloadItem`
- **Processing**: One file at a time with delays
- **Progress**: No batch-level progress tracking
- **Behavior**: Sequential file downloads

#### 3. Batch Unlike Operation (`useBulkUnlike.ts`)
- **Current**: NOT in queue system
- **Behavior**: Blocks UI with modal until complete
- **Processing**: One post at a time (450-500ms delays)
- **Progress**: Shown in modal component

#### 4. Batch Relike Operation (`useBulkRelike.ts`)
- **Current**: NOT in queue system
- **Behavior**: Blocks UI with modal until complete
- **Processing**: One post at a time (450-500ms delays)
- **Progress**: Shown in modal component

#### 5. Purge Operation (`PurgeModal.tsx`)
- **Current**: NOT in queue system
- **Behavior**: Processes 3 categories sequentially
- **Processing**: Each category is separate (liked-posts, unliked-archive, prompt-packs)
- **Progress**: Item-by-item visual feedback
- **Note**: Already matches target behavior (each item = separate job)

---

## Requirements

### New Behavior

| Operation | Current | Target |
|-----------|---------|--------|
| **Upscale** | Each video = queue item | All selected videos = 1 job with progress |
| **Download** | Each file = queue item | All selected files = 1 job with progress |
| **Unlike** | Blocks UI with modal | 1 job in queue, non-blocking |
| **Relike** | Blocks UI with modal | 1 job in queue, non-blocking |
| **Purge** | 3 items processed | 3 separate jobs in queue |

### Key Principles

1. **All batch jobs count as one job** - Multiple items wrapped in single job
2. **All batch jobs show progress** - Track `processedItems / totalItems`
3. **Upscale and download are separate** - No auto-download after upscaling
4. **Unlike/relike are non-blocking** - Add to queue and return immediately
5. **Purge shows in queue** - Each category is a separate job
6. **Sequential processing** - One job at a time (approved by user)
7. **One job per operation** - Regardless of how many posts selected (approved by user)

---

## Implementation Plan

### Phase 1: Core Architecture

#### Step 1.1: Define Job Types and Interfaces

**File**: `D:\projects\grkgoondl\src\types\index.ts`

```typescript
// Job types
export type JobType =
  | 'upscale'
  | 'download'
  | 'unlike'
  | 'relike'
  | 'purge-liked'
  | 'purge-archive'
  | 'purge-packs';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Base job interface
export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number; // 0-100
  totalItems: number;
  processedItems: number;
  createdAt: number;
  error?: string;

  // Type-specific data
  data: JobData;
}

// Job data types
export type JobData =
  | UpscaleJobData
  | DownloadJobData
  | UnlikeJobData
  | RelikeJobData
  | PurgeJobData;

export interface UpscaleJobData {
  type: 'upscale';
  postIds: string[];
  videoIds: string[];
  hdUrlMap?: Map<string, string>; // videoId -> hdUrl mapping
}

export interface DownloadJobData {
  type: 'download';
  postIds: string[];
  items: Array<{ url: string; filename: string }>;
}

export interface UnlikeJobData {
  type: 'unlike';
  postIds: string[];
  posts: LikedPost[]; // For archiving
}

export interface RelikeJobData {
  type: 'relike';
  postIds: string[];
}

export interface PurgeJobData {
  type: 'purge-liked' | 'purge-archive' | 'purge-packs';
  category: 'liked-posts' | 'unliked-archive' | 'prompt-packs';
}
```

#### Step 1.2: Create Unified Job Queue Store

**File**: `D:\projects\grkgoondl\src\store\useJobQueueStore.ts` (NEW)

**Key Features**:
- Maintains array of jobs
- Processes jobs sequentially (one at a time)
- Provides progress tracking per job
- Supports pause/resume
- Persists queue state

**Store Interface**:
```typescript
interface JobQueueStore {
  // State
  jobs: Job[];
  isProcessing: boolean;
  currentJobId: string | null;

  // Actions
  addJob: (job: Omit<Job, 'id' | 'createdAt'>) => string; // Returns job ID
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  startProcessing: () => void;
  stopProcessing: () => void;

  // Internal actions
  _processNextJob: () => Promise<void>;
  _updateJobProgress: (jobId: string, processedItems: number, progress: number) => void;
  _updateJobStatus: (jobId: string, status: JobStatus, error?: string) => void;
  _processUpscaleJob: (job: Job) => Promise<void>;
  _processDownloadJob: (job: Job) => Promise<void>;
  _processUnlikeJob: (job: Job) => Promise<void>;
  _processRelikeJob: (job: Job) => Promise<void>;
  _processPurgeJob: (job: Job) => Promise<void>;
}
```

**Processing Logic**:
1. Sequential job processing (one at a time)
2. Each job type has dedicated processor function
3. Progress updates as items complete
4. Auto-start on job addition (if not processing)
5. Persist queue state (except processing status)

---

### Phase 2: Job Processors

#### Step 2.1: Upscale Job Processor

**Logic**:
1. Receive job with `videoIds[]`
2. Process in batches of 15 (internal detail)
3. Update progress after each upscale request sent
4. Poll for HD URLs after all requests sent
5. Store HD URLs in job data
6. Mark completed/failed based on results
7. **NO auto-download** (user must create separate download job)

**Progress Calculation**: `(processedItems / totalItems) * 100`

#### Step 2.2: Download Job Processor

**Logic**:
1. Receive job with `items[]` (url + filename pairs)
2. Download one file at a time with delays
3. Update progress after each download
4. Handle success/failure per file
5. Mark job completed when all done

**Progress Calculation**: `(processedItems / totalItems) * 100`

#### Step 2.3: Unlike Job Processor

**Logic**:
1. Receive job with `postIds[]` and `posts[]`
2. Process posts one at a time with delays (450-500ms)
3. Update progress after each unlike
4. Archive posts to storage as processed
5. Mark job completed

**Progress Calculation**: `(processedItems / totalItems) * 100`

#### Step 2.4: Relike Job Processor

**Logic**:
1. Receive job with `postIds[]`
2. Process posts one at a time with delays (450-500ms)
3. Update progress after each relike
4. Remove from archive storage as processed
5. Mark job completed

**Progress Calculation**: `(processedItems / totalItems) * 100`

#### Step 2.5: Purge Job Processor

**Logic**:
1. Receive job with `category`
2. Process single category (always 1 item)
3. Call appropriate purge function
4. Mark completed

**Progress**: Simple 0% → 100% (single item)

---

### Phase 3: Refactor Existing Operations

#### Step 3.1: Update Upscale Operations

**Files to Modify**:
- `D:\projects\grkgoondl\src\components\views\OpsView.tsx`

**Changes**:
1. Replace `addToQueue(postId, videoIds)` with `addJob({ type: 'upscale', ... })`
2. Remove auto-download logic
3. Create separate download button/job

#### Step 3.2: Update Download Operations

**Files to Modify**:
- `D:\projects\grkgoondl\src\components\views\OpsView.tsx`

**Changes**:
1. Replace `addToDownloadQueue(...)` with `addJob({ type: 'download', ... })`
2. Download button creates separate job from upscale

#### Step 3.3: Migrate Unlike Operations

**Files to Modify**:
- `D:\projects\grkgoondl\src\hooks\useBulkUnlike.ts`
- `D:\projects\grkgoondl\src\components\modals\UnlikeModal.tsx`

**Changes**:
1. Remove blocking modal with progress bar
2. Replace with simple confirmation
3. On confirm: `addJob({ type: 'unlike', ... })` and close modal
4. User monitors progress in Queue view

#### Step 3.4: Migrate Relike Operations

**Files to Modify**:
- `D:\projects\grkgoondl\src\hooks\useBulkRelike.ts`
- `D:\projects\grkgoondl\src\components\modals\UnlikedArchiveModal.tsx`

**Changes**:
1. Remove blocking modal with progress bar
2. Replace with simple confirmation
3. On confirm: `addJob({ type: 'relike', ... })` and close modal
4. User monitors progress in Queue view

#### Step 3.5: Integrate Purge into Queue

**Files to Modify**:
- `D:\projects\grkgoondl\src\components\modals\PurgeModal.tsx`

**Changes**:
1. After challenge completes: create 3 purge jobs
2. Each category becomes a separate job:
   - `addJob({ type: 'purge-liked', ... })`
   - `addJob({ type: 'purge-archive', ... })`
   - `addJob({ type: 'purge-packs', ... })`
3. Close modal immediately
4. Jobs process sequentially in Queue

---

### Phase 4: Update UI Components

#### Step 4.1: Rebuild QueueView

**File**: `D:\projects\grkgoondl\src\components\views\QueueView.tsx`

**New Features**:
1. Display all job types (not just upscale)
2. Show job type icon and description
3. Progress bar per job
4. Current job shows: "Processing: X/Y items (Z%)"
5. Job status indicators (pending, processing, completed, failed)
6. Stats summary (pending, completed, failed counts)
7. Actions: Pause/Resume, Clear Completed, Clear All

**Job Display Format**:
```
[Icon] Upscaling 10 videos
       ████████░░░░░░░░░░ 8/10 (80%)

[Icon] Downloading 15 files
       [Pending]

[Icon] Unlike 50 posts
       [Pending]
```

#### Step 4.2: Update Queue Indicator

**File**: `D:\projects\grkgoondl\src\components\common\UpscaleQueueIndicator.tsx`

**Changes**:
1. Rename to `JobQueueIndicator.tsx`
2. Show total pending jobs count (not item count)
3. Update badge to show job count
4. Update icon to represent unified queue
5. Update imports throughout codebase

---

### Phase 5: Cleanup

#### Step 5.1: Remove Old Stores

**Files to Delete**:
- `D:\projects\grkgoondl\src\store\useUpscaleQueueStore.ts`
- `D:\projects\grkgoondl\src\store\useDownloadQueueStore.ts`

#### Step 5.2: Update Imports

**Files to Update**:
- All components importing old stores
- Update to import `useJobQueueStore`

#### Step 5.3: Remove Old Settings

**File**: `D:\projects\grkgoondl\src\store\useSettingsStore.ts`

**Changes**:
- Remove `autoDownload` setting (if exists)
- Remove related UI controls

#### Step 5.4: Update Types

**File**: `D:\projects\grkgoondl\src\types\index.ts`

**Changes**:
- Remove old `QueueItem` interface (replaced by `Job`)
- Remove `QueueItemStatus` (replaced by `JobStatus`)
- Keep or remove `DownloadItem` based on usage

---

## Testing Plan

### Test Cases

1. **Upscale Job**
   - [ ] Select multiple videos across multiple posts
   - [ ] Verify one job created
   - [ ] Verify progress updates correctly
   - [ ] Verify no auto-download occurs
   - [ ] Verify HD URLs stored in job data

2. **Download Job**
   - [ ] Select multiple media files
   - [ ] Verify one job created
   - [ ] Verify progress updates per file
   - [ ] Verify sequential downloads with delays

3. **Unlike Job**
   - [ ] Select multiple posts to unlike
   - [ ] Verify non-blocking (modal closes immediately)
   - [ ] Verify one job created
   - [ ] Verify progress updates
   - [ ] Verify posts archived correctly

4. **Relike Job**
   - [ ] Select multiple posts to relike
   - [ ] Verify non-blocking (modal closes immediately)
   - [ ] Verify one job created
   - [ ] Verify progress updates
   - [ ] Verify posts removed from archive

5. **Purge Jobs**
   - [ ] Complete purge challenge
   - [ ] Verify 3 separate jobs created
   - [ ] Verify they process sequentially
   - [ ] Verify each category purges correctly

6. **Queue Management**
   - [ ] Verify sequential processing (one job at a time)
   - [ ] Verify Pause/Resume works
   - [ ] Verify Clear Completed works
   - [ ] Verify Clear All works
   - [ ] Verify queue persists across sessions

7. **Queue View**
   - [ ] Verify all job types display correctly
   - [ ] Verify progress bars update
   - [ ] Verify status indicators work
   - [ ] Verify stats are accurate

8. **Queue Indicator**
   - [ ] Verify badge shows correct job count
   - [ ] Verify updates in real-time

---

## Migration Strategy

### Recommended Order

1. ✅ **Phase 1**: Create new types and unified store
2. ✅ **Phase 2**: Implement all job processors
3. ✅ **Phase 3**: Refactor operations one at a time
   - Start with upscale (least risk)
   - Then download
   - Then unlike/relike (more complex)
   - Finally purge
4. ✅ **Phase 4**: Update UI components
5. ✅ **Phase 5**: Clean up old code

### Rollback Plan

If issues arise:
1. Revert to previous commit
2. Old stores are kept until all testing passes
3. Feature flag can be added to toggle between systems

---

## File Structure Summary

### New Files
```
src/
  store/
    useJobQueueStore.ts          # NEW: Unified job queue
  types/
    index.ts                      # UPDATED: Add Job types
```

### Modified Files
```
src/
  components/
    views/
      QueueView.tsx              # UPDATED: Display all job types
      OpsView.tsx                # UPDATED: Use job system
    modals/
      UnlikeModal.tsx            # UPDATED: Non-blocking
      UnlikedArchiveModal.tsx    # UPDATED: Non-blocking
      PurgeModal.tsx             # UPDATED: Create jobs
    common/
      UpscaleQueueIndicator.tsx  # RENAMED: JobQueueIndicator.tsx
  hooks/
    useBulkUnlike.ts             # UPDATED: Use job system
    useBulkRelike.ts             # UPDATED: Use job system
  types/
    index.ts                     # UPDATED: Job interfaces
```

### Deleted Files
```
src/
  store/
    useUpscaleQueueStore.ts      # DELETED
    useDownloadQueueStore.ts     # DELETED
```

---

## Benefits of New System

1. **Unified Experience**: All batch operations in one place
2. **Non-Blocking**: Unlike/relike no longer block UI
3. **Better Progress Tracking**: All jobs show progress
4. **Clearer Separation**: Upscale and download are distinct
5. **Easier Monitoring**: Single queue view for all operations
6. **Consistent Behavior**: All batch operations work the same way
7. **Better UX**: Users can continue working while jobs process

---

## Known Limitations

1. **Sequential Processing**: Jobs process one at a time (by design)
2. **No Job Reordering**: Jobs process in FIFO order
3. **No Job Editing**: Can't modify job after creation
4. **No Partial Retry**: Failed jobs must be retried entirely

---

## Future Enhancements

Potential improvements for future versions:

1. **Job Priority**: Allow high-priority jobs to jump queue
2. **Parallel Processing**: Allow certain job types to run in parallel
3. **Job Scheduling**: Schedule jobs for specific times
4. **Job Dependencies**: Chain jobs (upscale → auto-download)
5. **Partial Retry**: Retry only failed items in a job
6. **Job History**: Keep completed jobs for longer
7. **Job Notifications**: Notify when jobs complete

---

## References

### Related Files

- Job Queue Store: `src/store/useJobQueueStore.ts`
- Type Definitions: `src/types/index.ts`
- Queue View: `src/components/views/QueueView.tsx`
- Ops Helpers: `src/utils/opsHelpers.ts`
- Batch Processing: `src/hooks/useBulkUnlike.ts`, `src/hooks/useBulkRelike.ts`

### External Dependencies

- Zustand: State management
- Zustand Persist: Queue persistence

---

**Document Version**: 1.0
**Last Updated**: 2025-12-19
**Status**: Implementation in Progress
