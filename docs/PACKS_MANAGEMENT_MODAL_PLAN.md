# Packs Management Modal - Implementation Plan

## Overview

This document outlines the plan to extract the packs import/export functionality from the Settings tab and create a dedicated Packs Management Modal with a modern split-panel interface featuring drag-and-drop functionality.

---

## 1. Goals

### Primary Objectives
- **Separate Concerns**: Move packs import/export logic out of Settings into a dedicated modal
- **Improve UX**: Create an intuitive split-panel interface for managing packs and prompts
- **Enable Drag & Drop**: Allow users to drag prompts onto packs for better organization
- **Pack Renaming**: Add ability to rename packs inline
- **Independent Scrolling**: Packs panel (left) and prompts panel (right) scroll separately

### User Benefits
- Clearer separation between settings and data management
- Visual, interactive pack management
- Faster prompt organization via drag-and-drop
- Better overview of all packs and their contents

---

## 2. Current State Analysis

### Existing Components

#### `SettingsView.tsx` (lines 486-595)
- Contains "Data Management" panel with:
  - Import/Export buttons
  - Import mode selection (add/replace)
  - Copy Grok prompt button
  - Status messages

#### `PackSelectModal.tsx`
- Used for selecting packs to export
- Features:
  - Checkbox-based multi-select
  - Select All / Deselect All buttons
  - Current pack badge
  - Selection summary

#### `ImportPackModal.tsx`
- Handles pack import via paste or file upload
- Features:
  - JSON validation
  - Support for both v1.0 (single pack) and v2.0 (multi-pack) formats
  - Paste from clipboard or file upload
  - Real-time validation feedback

#### `PackManager.tsx`
- Top navigation component for pack switching
- Features:
  - Pack dropdown selector
  - Add pack button
  - Delete pack button
  - Search modal trigger

### Store Structure (`usePromptStore.ts`)

```typescript
interface PromptStore {
  packs: Packs; // { [packName: string]: PromptItem[] }
  currentPack: string;
  currentIndex: number;

  // Pack operations
  setCurrentPack: (pack: string) => void;
  addPack: (name: string) => void;
  deletePack: (name: string) => void;

  // Import/Export
  exportCurrentPack: () => void;
  importPack: (file: File, mode: 'add' | 'replace') => Promise<...>;
}
```

### Modal System
- Uses Zustand-based modal store (`useModalStore`)
- `BaseModal` component provides consistent modal UI
- Theme-aware via `getThemeColors()`

---

## 3. New Architecture

### 3.1 Component Structure

```
PacksManagementModal/
├── PacksManagementModal.tsx         # Main container component
├── PacksPanel.tsx                   # Left panel - list of packs
├── PromptsPanel.tsx                 # Right panel - prompts in selected pack
├── PackListItem.tsx                 # Individual pack item (renameable)
├── PromptListItem.tsx               # Individual prompt item (draggable)
├── PacksManagementFooter.tsx        # Footer with import/export actions
└── types.ts                         # TypeScript definitions
```

### 3.2 Data Flow

```
PacksManagementModal
├── State: selectedPackName, importMode, statusMessage
├── Handlers: handleImport, handleExport, handleRenamePack, handleDragDrop
│
├── PacksPanel (left)
│   ├── Props: packs, selectedPack, onSelectPack, onRenamePack, onDeletePack
│   ├── Renders: List of PackListItem components
│   └── Features: Independent scrolling, pack selection
│
├── PromptsPanel (right)
│   ├── Props: prompts, packName, onPromptDragStart, onPromptDragEnd
│   ├── Renders: List of PromptListItem components
│   └── Features: Independent scrolling, displays prompts from selected pack
│
└── PacksManagementFooter
    ├── Props: importMode, onImport, onExport, onCopyGrokPrompt
    └── Features: Import/Export buttons, mode selection
```

---

## 4. Detailed Implementation Plan

### Phase 1: Create Base Modal Structure

#### Step 1.1: Create `PacksManagementModal.tsx`
- [ ] Create new modal component using `BaseModal`
- [ ] Set up state management:
  - `selectedPackName` - currently selected pack in left panel
  - `importMode` - 'add' | 'replace'
  - `statusMessage` - feedback messages
  - `isImportModalOpen` - control import sub-modal
  - `isExportModalOpen` - control export sub-modal
- [ ] Add modal open/close handlers
- [ ] Implement 2-column layout (flex container)

**File**: `src/components/modals/PacksManagementModal.tsx`

```typescript
interface PacksManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  getThemeColors: () => ThemeColors;
}

export const PacksManagementModal: React.FC<PacksManagementModalProps> = ({
  isOpen,
  onClose,
  getThemeColors,
}) => {
  const { packs, currentPack } = usePromptStore();
  const [selectedPackName, setSelectedPackName] = useState(currentPack);
  const [importMode, setImportMode] = useState<'add' | 'replace'>('add');
  // ... state and handlers

  return (
    <BaseModal
      isOpen={isOpen}
      title="Packs Management"
      onClose={onClose}
      getThemeColors={getThemeColors}
      maxWidth="xl"
      footer={<PacksManagementFooter ... />}
    >
      <div className="flex gap-4 h-[500px]">
        <PacksPanel ... />
        <PromptsPanel ... />
      </div>
    </BaseModal>
  );
};
```

#### Step 1.2: Create Types
- [ ] Define TypeScript interfaces in `types.ts`

**File**: `src/components/modals/PacksManagementModal/types.ts`

```typescript
export interface Pack {
  name: string;
  prompts: PromptItem[];
}

export interface PackListItemProps {
  packName: string;
  promptCount: number;
  isSelected: boolean;
  isCurrent: boolean;
  onSelect: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
  getThemeColors: () => ThemeColors;
}

export interface PromptListItemProps {
  prompt: PromptItem;
  index: number;
  isDraggable: boolean;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  getThemeColors: () => ThemeColors;
}

export interface PacksPanelProps {
  packs: Packs;
  selectedPackName: string;
  currentPack: string;
  onSelectPack: (name: string) => void;
  onRenamePack: (oldName: string, newName: string) => void;
  onDeletePack: (name: string) => void;
  onDropPrompt: (packName: string, promptIndex: number, sourcePack: string) => void;
  getThemeColors: () => ThemeColors;
}

export interface PromptsPanelProps {
  packName: string;
  prompts: PromptItem[];
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  getThemeColors: () => ThemeColors;
}
```

---

### Phase 2: Implement Packs Panel (Left Side)

#### Step 2.1: Create `PacksPanel.tsx`
- [ ] Create scrollable container for pack list
- [ ] Map through packs and render `PackListItem` for each
- [ ] Handle pack selection
- [ ] Implement drop zone for drag-and-drop (accept prompts)
- [ ] Style: fixed width (e.g., 280px), independent scrolling

**File**: `src/components/modals/PacksManagementModal/PacksPanel.tsx`

```typescript
export const PacksPanel: React.FC<PacksPanelProps> = ({
  packs,
  selectedPackName,
  currentPack,
  onSelectPack,
  onRenamePack,
  onDeletePack,
  onDropPrompt,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const packNames = Object.keys(packs);

  return (
    <div
      className="flex flex-col w-[280px] flex-shrink-0"
      style={{ borderRight: `1px solid ${colors.BORDER}` }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b" style={{ borderColor: colors.BORDER }}>
        <h3 className="text-sm font-semibold" style={{ color: colors.TEXT_PRIMARY }}>
          Packs ({packNames.length})
        </h3>
      </div>

      {/* Scrollable Pack List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {packNames.map((packName) => (
          <PackListItem
            key={packName}
            packName={packName}
            promptCount={packs[packName].length}
            isSelected={packName === selectedPackName}
            isCurrent={packName === currentPack}
            onSelect={onSelectPack}
            onRename={onRenamePack}
            onDelete={onDeletePack}
            onDropPrompt={(promptIndex, sourcePack) =>
              onDropPrompt(packName, promptIndex, sourcePack)
            }
            getThemeColors={getThemeColors}
          />
        ))}
      </div>
    </div>
  );
};
```

#### Step 2.2: Create `PackListItem.tsx`
- [ ] Display pack name, prompt count, badges
- [ ] Implement inline rename (double-click or edit icon)
- [ ] Show "Current" badge if pack is currently active
- [ ] Highlight if selected
- [ ] Implement drop zone for dragged prompts
- [ ] Add delete button (with confirmation)

**File**: `src/components/modals/PacksManagementModal/PackListItem.tsx`

```typescript
export const PackListItem: React.FC<PackListItemProps> = ({
  packName,
  promptCount,
  isSelected,
  isCurrent,
  onSelect,
  onRename,
  onDelete,
  onDropPrompt,
  getThemeColors,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(packName);
  const [isDragOver, setIsDragOver] = useState(false);
  const colors = getThemeColors();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    onDropPrompt(data.promptIndex, data.sourcePack);
  };

  const handleRename = () => {
    if (editName.trim() && editName !== packName) {
      onRename(packName, editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className="p-2 mb-1 rounded-lg cursor-pointer transition-all"
      style={{
        backgroundColor: isSelected
          ? colors.BACKGROUND_MEDIUM
          : isDragOver
          ? colors.SUCCESS + '20'
          : colors.BACKGROUND_DARK,
        border: `1px solid ${
          isDragOver ? colors.SUCCESS : isSelected ? colors.TEXT_SECONDARY : colors.BORDER
        }`,
      }}
      onClick={() => onSelect(packName)}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {isEditing ? (
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') { setEditName(packName); setIsEditing(false); }
          }}
          className="w-full px-1 rounded"
          style={{ backgroundColor: colors.BACKGROUND_MEDIUM, color: colors.TEXT_PRIMARY }}
          autoFocus
        />
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate" style={{ color: colors.TEXT_PRIMARY }}>
              {packName}
            </div>
            <div className="text-xs" style={{ color: colors.TEXT_SECONDARY }}>
              {promptCount} prompt{promptCount !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isCurrent && (
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: colors.SUCCESS, color: '#fff' }}>
                Current
              </span>
            )}

            <Button
              icon={mdiPencil}
              iconSize={0.5}
              variant="icon"
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              tooltip="Rename pack"
            />

            <Button
              icon={mdiDelete}
              iconSize={0.5}
              variant="icon"
              onClick={(e) => { e.stopPropagation(); onDelete(packName); }}
              tooltip="Delete pack"
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

---

### Phase 3: Implement Prompts Panel (Right Side)

#### Step 3.1: Create `PromptsPanel.tsx`
- [ ] Display prompts from selected pack
- [ ] Implement independent scrolling
- [ ] Handle empty state (no prompts in pack)
- [ ] Show pack name in header

**File**: `src/components/modals/PacksManagementModal/PromptsPanel.tsx`

```typescript
export const PromptsPanel: React.FC<PromptsPanelProps> = ({
  packName,
  prompts,
  onDragStart,
  onDragEnd,
  getThemeColors,
}) => {
  const colors = getThemeColors();

  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* Header */}
      <div className="px-3 py-2 border-b" style={{ borderColor: colors.BORDER }}>
        <h3 className="text-sm font-semibold truncate" style={{ color: colors.TEXT_PRIMARY }}>
          {packName} ({prompts.length} prompt{prompts.length !== 1 ? 's' : ''})
        </h3>
      </div>

      {/* Scrollable Prompts List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {prompts.length === 0 ? (
          <div className="text-center py-8" style={{ color: colors.TEXT_SECONDARY }}>
            <Icon path={mdiPackageVariant} size={2} color={colors.TEXT_SECONDARY} />
            <p className="mt-2 text-sm">No prompts in this pack</p>
          </div>
        ) : (
          prompts.map((prompt, index) => (
            <PromptListItem
              key={index}
              prompt={prompt}
              index={index}
              isDraggable={true}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              getThemeColors={getThemeColors}
            />
          ))
        )}
      </div>
    </div>
  );
};
```

#### Step 3.2: Create `PromptListItem.tsx`
- [ ] Display prompt text (truncated)
- [ ] Show rating (stars)
- [ ] Make draggable
- [ ] Visual feedback during drag

**File**: `src/components/modals/PacksManagementModal/PromptListItem.tsx`

```typescript
export const PromptListItem: React.FC<PromptListItemProps> = ({
  prompt,
  index,
  isDraggable,
  onDragStart,
  onDragEnd,
  getThemeColors,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const colors = getThemeColors();

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      promptIndex: index,
      sourcePack: packName, // Need to pass this from parent
    }));
    onDragStart(index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="p-3 mb-2 rounded-lg cursor-move transition-all"
      style={{
        backgroundColor: colors.BACKGROUND_DARK,
        border: `1px solid ${colors.BORDER}`,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className="flex items-start gap-2">
        <Icon path={mdiDrag} size={0.7} color={colors.TEXT_SECONDARY} />

        <div className="flex-1 min-w-0">
          <p className="text-sm line-clamp-2" style={{ color: colors.TEXT_PRIMARY }}>
            {prompt.text || <em style={{ color: colors.TEXT_SECONDARY }}>Empty prompt</em>}
          </p>

          {/* Star Rating */}
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                path={star <= prompt.rating ? mdiStar : mdiStarOutline}
                size={0.5}
                color={star <= prompt.rating ? '#fbbf24' : colors.TEXT_SECONDARY}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

### Phase 4: Implement Footer & Actions

#### Step 4.1: Create `PacksManagementFooter.tsx`
- [ ] Import mode selection (radio buttons)
- [ ] Import button (opens `ImportPackModal`)
- [ ] Export button (opens `PackSelectModal`)
- [ ] Copy Grok prompt button
- [ ] Status message display

**File**: `src/components/modals/PacksManagementModal/PacksManagementFooter.tsx`

```typescript
interface PacksManagementFooterProps {
  importMode: 'add' | 'replace';
  onImportModeChange: (mode: 'add' | 'replace') => void;
  onImport: () => void;
  onExport: () => void;
  onCopyGrokPrompt: () => void;
  statusMessage: string;
  getThemeColors: () => ThemeColors;
}

export const PacksManagementFooter: React.FC<PacksManagementFooterProps> = ({
  importMode,
  onImportModeChange,
  onImport,
  onExport,
  onCopyGrokPrompt,
  statusMessage,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Import Mode Selection */}
      <div className="flex items-center gap-4 text-sm">
        <span style={{ color: colors.TEXT_SECONDARY }}>Import Mode:</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="add"
            checked={importMode === 'add'}
            onChange={() => onImportModeChange('add')}
            style={{ accentColor: colors.SUCCESS }}
          />
          <span style={{ color: colors.TEXT_PRIMARY }}>Add (create new)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="replace"
            checked={importMode === 'replace'}
            onChange={() => onImportModeChange('replace')}
            style={{ accentColor: colors.SUCCESS }}
          />
          <span style={{ color: colors.TEXT_PRIMARY }}>Replace (overwrite)</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onImport}
          icon={mdiUpload}
          className="flex-1"
          tooltip="Import pack from file or clipboard"
        >
          Import
        </Button>

        <Button
          onClick={onCopyGrokPrompt}
          icon={mdiContentCopy}
          variant="icon"
          tooltip="Copy Grok system prompt"
        />

        <Button
          onClick={onExport}
          icon={mdiDownload}
          className="flex-1"
          tooltip="Export selected packs"
        >
          Export
        </Button>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className="text-xs text-center p-2 rounded-lg"
          style={{
            backgroundColor: colors.BACKGROUND_MEDIUM,
            color: colors.SUCCESS,
            border: `1px solid ${colors.BORDER}`,
          }}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
};
```

---

### Phase 5: Implement Drag & Drop Logic

#### Step 5.1: Add Store Methods
- [ ] Add `movePromptToPack` method to `usePromptStore`

**File**: `src/store/usePromptStore.ts`

```typescript
// Add to PromptStore interface
movePromptToPack: (
  promptIndex: number,
  sourcePack: string,
  targetPack: string
) => void;

// Implementation
movePromptToPack: (promptIndex, sourcePack, targetPack) => {
  const { packs } = get();

  // Get the prompt to move
  const sourcePrompts = [...packs[sourcePack]];
  const promptToMove = sourcePrompts[promptIndex];

  if (!promptToMove) return;

  // Remove from source pack
  sourcePrompts.splice(promptIndex, 1);

  // Add to target pack
  const targetPrompts = [...packs[targetPack], promptToMove];

  // Update state
  set({
    packs: {
      ...packs,
      [sourcePack]: sourcePrompts,
      [targetPack]: targetPrompts,
    },
  });

  get().saveToStorage();
},
```

#### Step 5.2: Wire Up Drag & Drop Handlers
- [ ] Connect drag start/end events in `PromptsPanel`
- [ ] Connect drop events in `PackListItem`
- [ ] Add visual feedback during drag operations

---

### Phase 6: Integrate with Settings

#### Step 6.1: Update `SettingsView.tsx`
- [ ] Remove "Data Management" panel (lines 486-595)
- [ ] Add "Packs Management" button in its place
- [ ] Button opens `PacksManagementModal`

**File**: `src/components/views/SettingsView.tsx`

```typescript
// Replace Data Management panel with:
<div className="rounded-xl p-4 backdrop-blur-md border" style={...}>
  <div className="text-xs font-semibold uppercase tracking-wider mb-3 pb-2 border-b"
    style={{ color: colors.TEXT_SECONDARY, borderColor: `${colors.BORDER}40` }}>
    Packs Management
  </div>

  <Button
    onClick={() => setIsPacksModalOpen(true)}
    icon={mdiPackageVariant}
    className="w-full"
    tooltip="Manage packs, import/export, and organize prompts"
  >
    Open Packs Management
  </Button>
</div>

{/* Packs Management Modal */}
<PacksManagementModal
  isOpen={isPacksModalOpen}
  onClose={() => setIsPacksModalOpen(false)}
  getThemeColors={getThemeColors}
/>
```

#### Step 6.2: Add Rename Pack Method to Store
- [ ] Add `renamePack` method to `usePromptStore`

```typescript
renamePack: (oldName: string, newName: string) => void;

// Implementation
renamePack: (oldName, newName) => {
  const { packs, currentPack } = get();

  if (!packs[oldName] || packs[newName] || !newName.trim()) {
    return; // Validation: old pack must exist, new name must not exist and not be empty
  }

  const newPacks = { ...packs };
  newPacks[newName] = newPacks[oldName];
  delete newPacks[oldName];

  set({
    packs: newPacks,
    currentPack: currentPack === oldName ? newName : currentPack,
  });

  get().saveToStorage();
},
```

---

## 5. File Changes Summary

### New Files to Create
1. `src/components/modals/PacksManagementModal/PacksManagementModal.tsx`
2. `src/components/modals/PacksManagementModal/PacksPanel.tsx`
3. `src/components/modals/PacksManagementModal/PromptsPanel.tsx`
4. `src/components/modals/PacksManagementModal/PackListItem.tsx`
5. `src/components/modals/PacksManagementModal/PromptListItem.tsx`
6. `src/components/modals/PacksManagementModal/PacksManagementFooter.tsx`
7. `src/components/modals/PacksManagementModal/types.ts`
8. `src/components/modals/PacksManagementModal/index.ts` (barrel export)

### Files to Modify
1. `src/components/views/SettingsView.tsx`
   - Remove Data Management panel (lines 486-595)
   - Add Packs Management button
   - Import and render `PacksManagementModal`

2. `src/store/usePromptStore.ts`
   - Add `renamePack` method
   - Add `movePromptToPack` method

### Files to Keep (Reuse)
1. `src/components/modals/PackSelectModal.tsx` - for export
2. `src/components/modals/ImportPackModal.tsx` - for import
3. `src/components/modals/BaseModal.tsx` - modal wrapper

---

## 6. UI/UX Design Specifications

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Packs Management                                      [X]    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┬──────────────────────────────────┐    │
│  │  Packs (5)       │  My Custom Pack (12 prompts)     │    │
│  ├──────────────────┼──────────────────────────────────┤    │
│  │                  │                                   │    │
│  │ ┌──────────────┐ │ ┌──────────────────────────────┐ │    │
│  │ │ Default      │ │ │ [≡] A cinematic shot of...   │ │    │
│  │ │ 8 prompts    │ │ │     ★★★★☆                    │ │    │
│  │ │ [Current]    │ │ └──────────────────────────────┘ │    │
│  │ └──────────────┘ │                                   │    │
│  │                  │ ┌──────────────────────────────┐ │    │
│  │ ┌──────────────┐ │ │ [≡] Aerial view of mountain  │ │    │
│  │ │ My Custom... │◄├─┤     ★★★★★                    │ │    │
│  │ │ 12 prompts   │ │ └──────────────────────────────┘ │    │
│  │ └──────────────┘ │                                   │    │
│  │     (selected)   │ ┌──────────────────────────────┐ │    │
│  │                  │ │ [≡] Slow motion footage of   │ │    │
│  │ ┌──────────────┐ │ │     ★★★☆☆                    │ │    │
│  │ │ Sci-Fi       │ │ └──────────────────────────────┘ │    │
│  │ │ 6 prompts    │ │                                   │    │
│  │ └──────────────┘ │            (scrollable)           │    │
│  │                  │                                   │    │
│  │  (scrollable)    │                                   │    │
│  └──────────────────┴──────────────────────────────────┘    │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  Import Mode: ○ Add (create new)  ● Replace (overwrite)     │
│  ┌──────────┐  [📋]  ┌──────────┐                           │
│  │  Import  │         │  Export  │                           │
│  └──────────┘         └──────────┘                           │
│  ✓ Pack imported successfully!                               │
└─────────────────────────────────────────────────────────────┘
```

### Dimensions
- Modal width: `xl` (1200px)
- Modal height: 500px + header/footer
- Left panel (Packs): 280px fixed width
- Right panel (Prompts): flex-1 (remaining space)
- Both panels: independent scrolling

### Color & Styling
- Use existing theme colors via `getThemeColors()`
- Selected pack: `BACKGROUND_MEDIUM` background, `TEXT_SECONDARY` border
- Hover states: `TEXT_HOVER` background
- Drag over: `SUCCESS` border with 20% opacity background
- Current badge: `SUCCESS` background, white text

### Interactions

#### Pack Selection
- Click pack item to select and view its prompts in right panel
- Selected pack gets highlighted background

#### Pack Renaming
- Click pencil icon to enter edit mode
- Inline input appears
- Enter to confirm, Escape to cancel
- Validation: no duplicates, no empty names

#### Pack Deletion
- Click delete icon
- Show confirmation modal (reuse `ConfirmDeleteModal`)
- Cannot delete last remaining pack

#### Drag & Drop
1. User drags prompt from right panel
2. Prompt becomes semi-transparent (opacity: 0.5)
3. Pack items in left panel show drop zone highlight on hover
4. User drops on target pack
5. Prompt moves to target pack
6. If source pack becomes empty after move, show empty state

---

## 7. Technical Considerations

### Performance
- Use React.memo for list items to prevent unnecessary re-renders
- Debounce rename input validation
- Virtual scrolling if pack/prompt lists become very large (>100 items)

### Accessibility
- Keyboard navigation for pack selection (arrow keys)
- Tab order: packs panel → prompts panel → footer buttons
- Screen reader announcements for drag & drop actions
- ARIA labels for icon-only buttons

### Browser Compatibility
- HTML5 Drag & Drop API (supported in all modern browsers)
- Fallback: disable drag & drop on unsupported browsers (graceful degradation)

### Error Handling
- Validate pack names on rename (no duplicates, not empty)
- Handle edge cases:
  - Moving prompt from pack with only 1 prompt (don't leave pack empty)
  - Renaming to existing pack name (show error)
  - Deleting current pack (switch to another pack first)

---

## 8. Testing Plan

### Unit Tests
- [ ] Pack renaming validation logic
- [ ] Drag & drop data transfer
- [ ] Store methods: `movePromptToPack`, `renamePack`

### Integration Tests
- [ ] Import flow: open modal → select file → import → close
- [ ] Export flow: open modal → select packs → export
- [ ] Drag & drop: drag prompt → drop on pack → verify move

### Manual Testing Scenarios
1. Open Packs Management from Settings
2. Select different packs, verify prompts display correctly
3. Rename a pack, verify state updates
4. Delete a pack (not the last one)
5. Drag prompt from one pack to another
6. Import a new pack
7. Export multiple packs
8. Test with empty pack (no prompts)
9. Test with single pack (delete should be disabled)

---

## 9. Future Enhancements (Out of Scope)

- Bulk prompt operations (select multiple, move all at once)
- Duplicate pack functionality
- Merge packs
- Sort prompts within pack (by rating, alphabetically)
- Search/filter prompts within pack
- Prompt editing directly from management modal
- Export individual prompts
- Undo/redo for pack operations

---

## 10. Migration & Rollout

### Backwards Compatibility
- No data migration needed (existing pack structure remains unchanged)
- Old import/export functionality moves to new modal (same logic, different UI)

### Rollout Strategy
1. Implement all components in feature branch
2. Test thoroughly with existing packs data
3. Merge to main
4. Deploy with release notes explaining new modal location

### User Communication
- Release notes: "Packs management moved to dedicated modal"
- Show tooltip on "Open Packs Management" button
- Consider in-app announcement on first open after update

---

## 11. Implementation Checklist

### Phase 1: Base Structure
- [ ] Create modal component files
- [ ] Set up TypeScript types
- [ ] Implement basic layout (2-column)

### Phase 2: Packs Panel
- [ ] Create PacksPanel component
- [ ] Create PackListItem component
- [ ] Implement pack selection
- [ ] Implement pack renaming
- [ ] Implement pack deletion

### Phase 3: Prompts Panel
- [ ] Create PromptsPanel component
- [ ] Create PromptListItem component
- [ ] Display prompts from selected pack
- [ ] Handle empty state

### Phase 4: Footer & Actions
- [ ] Create footer component
- [ ] Wire up import modal
- [ ] Wire up export modal
- [ ] Add Grok prompt copy

### Phase 5: Drag & Drop
- [ ] Make prompts draggable
- [ ] Add drop zones to packs
- [ ] Implement movePromptToPack logic
- [ ] Add visual feedback

### Phase 6: Integration
- [ ] Update SettingsView
- [ ] Add renamePack to store
- [ ] Test full flow
- [ ] Fix bugs and polish

### Phase 7: Polish
- [ ] Add loading states
- [ ] Add error handling
- [ ] Improve accessibility
- [ ] Test on different themes
- [ ] Write documentation

---

## 12. Timeline Estimate

- **Phase 1**: 2-3 hours
- **Phase 2**: 3-4 hours
- **Phase 3**: 2-3 hours
- **Phase 4**: 2 hours
- **Phase 5**: 3-4 hours
- **Phase 6**: 2 hours
- **Phase 7**: 2-3 hours

**Total**: ~16-21 hours

---

## 13. Dependencies & Icons

### Required MDI Icons
- `mdiPackageVariant` - pack icon
- `mdiDrag` - drag handle
- `mdiPencil` - edit/rename
- `mdiDelete` - delete pack
- `mdiUpload` - import
- `mdiDownload` - export
- `mdiContentCopy` - copy Grok prompt
- `mdiStar` - filled star (rating)
- `mdiStarOutline` - empty star (rating)

### NPM Packages (Already Installed)
- `zustand` - state management
- `react` - UI framework
- `@mdi/js` - Material Design Icons

---

## End of Plan

This plan provides a comprehensive roadmap for implementing the Packs Management Modal. Follow the phases sequentially, testing at each step to ensure functionality before moving forward.
