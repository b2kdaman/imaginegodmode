# Implementation Plan: "Make + Next" Button

## Overview
Add a "Make + Next" button to the PromptView that executes the Make action (applies prompt with prefix and clicks Make video button) and then automatically navigates to the next post in the fetched posts list.

## Current Architecture Analysis

### Make Button Flow
- **Location**: `src/components/PromptView.tsx:265-273`
- **Handler**: `handlePlayClick()` at line 123
- **Action**: Calls `applyPromptAndMake(currentPrompt.text, prefix)` from `src/utils/promptActions.ts`
- **What it does**:
  1. Combines prefix + prompt text
  2. Sets textarea value on the page
  3. Clicks the "Make video" button after 100ms delay

### Post Data Structure
- **Type**: `LikedPost` defined in `src/types/index.ts`
- **Key fields**: `id`, `prompt`, `mediaUrl`, `thumbnailImageUrl`, etc.
- **Fetched by**: `fetchLikedPosts()` and `fetchUnlikedPosts()` in `src/api/grokApi.ts`
- **Currently stored in**: `OpsView.tsx` component state (lines 41-42)

### Post Navigation
- **Current URL format**: `https://grok.com/imagine/post/{postId}`
- **Current post ID extraction**: `getPostIdFromUrl()` from `src/utils/helpers.ts:11-15`
- **Navigation method**: `window.location.href = 'https://grok.com/imagine/post/{nextPostId}'` (OpsView.tsx:228)

## Implementation Approach

### Option 1: Create a Global Posts Store (Recommended)
**Pros:**
- Clean separation of concerns
- Posts accessible from any component
- Consistent with existing architecture (uses Zustand like other stores)
- Easy to add more post-related features later

**Cons:**
- Requires creating new store
- More files to modify

### Option 2: Pass Posts via Props/Context
**Pros:**
- No new store needed
- Simpler immediate implementation

**Cons:**
- Creates tight coupling between OpsView and PromptView
- Props drilling or context overhead
- Less scalable

**Decision: Go with Option 1** - Create a global posts store for better architecture.

## Implementation Steps

### 1. Create Posts Store
**File**: `src/store/usePostsStore.ts` (new file)

Store structure:
```typescript
interface PostsStore {
  // State
  posts: LikedPost[];          // Currently fetched posts
  currentPostId: string | null; // Current post ID from URL

  // Actions
  setPosts: (posts: LikedPost[]) => void;
  setCurrentPostId: (id: string | null) => void;
  getNextPostId: () => string | null;  // Find next post in list
  getPrevPostId: () => string | null;  // Find previous post in list
}
```

**Key logic for `getNextPostId()`:**
1. Find index of current post in posts array
2. Return next post's ID (or null if last/not found)
3. Handle edge cases (empty list, post not in list)

### 2. Update OpsView to Use Posts Store
**File**: `src/components/OpsView.tsx`

Changes:
- Import `usePostsStore`
- Replace local `likedPosts` state with store's `setPosts()`
- Replace local `unlikedPosts` state with store's `setPosts()`
- Call `setCurrentPostId()` when URL changes (in `handleFetchPost`)

Lines to modify:
- Line 41-42: Remove local state, use store instead
- Line 135: Call `setPosts()` after fetching liked posts
- Line 183: Call `setPosts()` after fetching unliked posts
- Line 51-52: Call `setCurrentPostId()` when post ID changes

### 3. Add "Make + Next" Action Utility
**File**: `src/utils/promptActions.ts`

Add new function:
```typescript
export const applyPromptMakeAndNext = (
  promptText: string,
  prefix: string = '',
  nextPostId: string | null,
  delay: number = 100
): void => {
  // 1. Apply prompt and make (existing logic)
  applyPromptAndMake(promptText, prefix, delay);

  // 2. Navigate to next post after delay + buffer
  if (nextPostId) {
    setTimeout(() => {
      window.location.href = `https://grok.com/imagine/post/${nextPostId}`;
    }, delay + 1000); // Wait for Make to execute first
  }
}
```

**Timing considerations:**
- Current Make delay: 100ms
- Need buffer for Make button click to process
- Suggested: 1000ms (1 second) after Make click before navigation
- Total delay: 1100ms from button press to navigation

### 4. Add "Make + Next" Button to PromptView
**File**: `src/components/PromptView.tsx`

Changes:
1. Import `usePostsStore` and new utility function
2. Add handler for Make + Next button
3. Add button to UI (next to existing Make button)

**Handler logic:**
```typescript
const handleMakeAndNextClick = () => {
  if (!currentPrompt) return;

  const nextPostId = getNextPostId(); // From posts store

  if (!nextPostId) {
    // Show message or disable button if no next post
    return;
  }

  trackVideoMakeClicked(); // Track analytics
  applyPromptMakeAndNext(currentPrompt.text, prefix, nextPostId);
};
```

**UI placement** (line 244-274):
- Add as a new row (row 3) below the existing Make button row
- Full-width button for prominence

**Button design:**
- Icon: `mdiPlaySkipForward` or `mdiSkipNext` from `@mdi/js`
- Label: "Make + Next"
- Style: Similar to Make button (white background, black text)
- Full width: `className="w-full !bg-white !text-black hover:!bg-white/90"`
- Disabled when: no next post available
- Tooltip: "Make video and navigate to next post"

### 5. Update URL Watcher in PromptView
**File**: `src/components/PromptView.tsx`

Ensure `setCurrentPostId()` is called when URL changes:
- In `loadPostData()` callback (line 56)
- After extracting `currentPostId` from URL

### 6. Handle Edge Cases

**No next post:**
- Disable button when `getNextPostId()` returns null
- Show tooltip explaining why disabled

**No posts fetched yet:**
- Button disabled until posts are loaded
- Consider showing loading state

**Post not in fetched list:**
- If current post ID not found in posts array, disable button
- User may be on a post outside the fetched list

**Posts list changes:**
- When switching between "Upscale All Liked" and "Show Unliked", posts list changes
- Store should handle this gracefully
- Button availability updates reactively

## File Changes Summary

### New Files
1. `src/store/usePostsStore.ts` - New Zustand store for posts

### Modified Files
1. `src/components/OpsView.tsx` - Use posts store instead of local state
2. `src/components/PromptView.tsx` - Add Make + Next button and handler
3. `src/utils/promptActions.ts` - Add `applyPromptMakeAndNext()` function

### Icons Needed
- Import `mdiSkipNext` or `mdiPlaySkipForward` from `@mdi/js`

## Testing Considerations

### Manual Testing Steps
1. Navigate to a post with image generations
2. Click "Upscale All Liked" or "Show Unliked" to fetch posts
3. Close modal (posts are now in store)
4. Click "Make + Next" button
5. Verify:
   - Make video button is clicked
   - Navigation happens after ~1 second
   - Lands on next post in the list
   - Button is disabled on last post

### Edge Cases to Test
1. Last post in list - button should be disabled
2. First post in list - button should work
3. No posts fetched - button should be disabled
4. Current post not in fetched list - button should be disabled
5. Switching between liked/unliked posts - button should update

## Future Enhancements (Not in Scope)

1. **"Make + Prev" button** - Navigate to previous post
2. **Auto-fetch posts** - Automatically fetch posts on component mount
3. **Keyboard shortcut** - Add hotkey for Make + Next (e.g., Ctrl+Shift+Enter)
4. **Show position in list** - Display "Post 3 of 20" in UI
5. **Loop to first** - When at last post, navigate to first post
6. **Queue mode** - Automatically Make + Next through all posts in list

## Open Questions

1. **Which posts list to use?**
   - Should the button use the most recently fetched list (liked OR unliked)?
   - Or should we track both separately?
   - **Proposed**: Use single `posts` array, updated by whichever fetch happened most recently

2. **Auto-fetch posts on mount?**
   - Currently user must manually click "Upscale All Liked" or "Show Unliked"
   - Should we auto-fetch liked posts when component mounts?
   - **Proposed**: Keep manual for now, add auto-fetch in future enhancement

3. **Navigation timing?**
   - 1 second delay enough for Make to process?
   - Should we wait for video generation to start?
   - **Proposed**: 1 second is sufficient, user can adjust if needed

4. **Button placement?**
   - Keep 3-button row and add 4th button?
   - Split into 2x2 grid?
   - Add as new dedicated row?
   - **Decision**: Place in new row (row 3) as full-width button for prominence
