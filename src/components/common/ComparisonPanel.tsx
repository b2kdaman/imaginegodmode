import React, { useState, useCallback } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from '@/components/inputs/Button';
import { Icon } from '@/components/common/Icon';
import { mdiCompare, mdiClose, mdiArrowLeft, mdiArrowRight, mdiContentCopy } from '@mdi/js';

interface ComparisonSlot {
  text: string;
  rating: number;
}

export const ComparisonPanel: React.FC = () => {
  const { getCurrentPrompt } = usePromptStore();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);
  const [slotA, setSlotA] = useState<ComparisonSlot | null>(null);
  const [slotB, setSlotB] = useState<ComparisonSlot | null>(null);

  const currentPrompt = getCurrentPrompt();

  const addToSlotA = useCallback(() => {
    if (currentPrompt) {
      setSlotA({ text: currentPrompt.text, rating: currentPrompt.rating || 0 });
    }
  }, [currentPrompt]);

  const addToSlotB = useCallback(() => {
    if (currentPrompt) {
      setSlotB({ text: currentPrompt.text, rating: currentPrompt.rating || 0 });
    }
  }, [currentPrompt]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearSlots = () => {
    setSlotA(null);
    setSlotB(null);
  };

  if (!isExpanded && !slotA && !slotB) {
    return (
      <div className="mt-3">
        <Button
          icon={mdiCompare}
          onClick={() => setIsExpanded(true)}
          className="text-xs"
        >
          Compare Prompts
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
          border: `1px solid ${colors.BORDER}`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon path={mdiCompare} size={0.8} color={colors.TEXT_SECONDARY} />
            <span className="text-xs font-medium" style={{ color: colors.TEXT_SECONDARY }}>
              Comparison Mode
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="icon"
              icon={mdiClose}
              onClick={() => {
                clearSlots();
                setIsExpanded(false);
              }}
              tooltip="Close"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div
            className="p-2 rounded"
            style={{ backgroundColor: `${colors.BACKGROUND_LIGHT}50` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: colors.TEXT_SECONDARY }}>
                Prompt A
              </span>
              <div className="flex gap-1">
                <Button
                  variant="icon"
                  icon={mdiArrowLeft}
                  onClick={addToSlotA}
                  tooltip="Add current prompt"
                />
                {slotA && (
                  <Button
                    variant="icon"
                    icon={mdiContentCopy}
                    onClick={() => copyToClipboard(slotA.text)}
                    tooltip="Copy"
                  />
                )}
              </div>
            </div>
            {slotA ? (
              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: colors.TEXT_PRIMARY }}
                >
                  {slotA.text.length > 100 ? `${slotA.text.slice(0, 100)}...` : slotA.text}
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="text-xs"
                      style={{
                        color: star <= slotA.rating ? (colors.SUCCESS || '#4ade80') : colors.TEXT_SECONDARY,
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs italic" style={{ color: colors.TEXT_SECONDARY }}>
                Click ← to add current prompt
              </p>
            )}
          </div>

          <div
            className="p-2 rounded"
            style={{ backgroundColor: `${colors.BACKGROUND_LIGHT}50` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: colors.TEXT_SECONDARY }}>
                Prompt B
              </span>
              <div className="flex gap-1">
                <Button
                  variant="icon"
                  icon={mdiArrowRight}
                  onClick={addToSlotB}
                  tooltip="Add current prompt"
                />
                {slotB && (
                  <Button
                    variant="icon"
                    icon={mdiContentCopy}
                    onClick={() => copyToClipboard(slotB.text)}
                    tooltip="Copy"
                  />
                )}
              </div>
            </div>
            {slotB ? (
              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: colors.TEXT_PRIMARY }}
                >
                  {slotB.text.length > 100 ? `${slotB.text.slice(0, 100)}...` : slotB.text}
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="text-xs"
                      style={{
                        color: star <= slotB.rating ? (colors.SUCCESS || '#4ade80') : colors.TEXT_SECONDARY,
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs italic" style={{ color: colors.TEXT_SECONDARY }}>
                Click → to add current prompt
              </p>
            )}
          </div>
        </div>

        {slotA && slotB && (
          <div
            className="p-2 rounded"
            style={{ backgroundColor: `${colors.BACKGROUND_LIGHT}30` }}
          >
            <div className="text-xs font-medium mb-2" style={{ color: colors.TEXT_SECONDARY }}>
              Comparison
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span style={{ color: colors.TEXT_SECONDARY }}>Length: </span>
                <span style={{ color: colors.TEXT_PRIMARY }}>
                  {slotA.text.length} chars
                </span>
              </div>
              <div>
                <span style={{ color: colors.TEXT_SECONDARY }}>Length: </span>
                <span style={{ color: colors.TEXT_PRIMARY }}>
                  {slotB.text.length} chars
                </span>
              </div>
              <div>
                <span style={{ color: colors.TEXT_SECONDARY }}>Rating: </span>
                <span style={{ color: colors.TEXT_PRIMARY }}>
                  {slotA.rating}/5
                </span>
              </div>
              <div>
                <span style={{ color: colors.TEXT_SECONDARY }}>Rating: </span>
                <span style={{ color: colors.TEXT_PRIMARY }}>
                  {slotB.rating}/5
                </span>
              </div>
              <div>
                <span style={{ color: colors.TEXT_SECONDARY }}>Words: </span>
                <span style={{ color: colors.TEXT_PRIMARY }}>
                  {slotA.text.split(/\s+/).filter(Boolean).length}
                </span>
              </div>
              <div>
                <span style={{ color: colors.TEXT_SECONDARY }}>Words: </span>
                <span style={{ color: colors.TEXT_PRIMARY }}>
                  {slotB.text.split(/\s+/).filter(Boolean).length}
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${colors.BORDER}` }}>
              <div className="text-xs" style={{ color: colors.TEXT_SECONDARY }}>
                <strong>Tip:</strong> Navigate between prompts using the arrows, then add them to slots A or B to compare.
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-2">
          <Button
            icon={mdiClose}
            onClick={clearSlots}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};
