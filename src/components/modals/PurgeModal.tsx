/**
 * Purge modal with arrow key challenge
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../inputs/Button';
import { mdiAlertCircle, mdiDelete } from '@mdi/js';
import { Icon } from '../common/Icon';
import { BaseModal } from './BaseModal';
import { useTranslation } from '@/contexts/I18nContext';
import { playCorrectKeySound, playWrongKeySound, playSuccessChord } from '@/utils/audio';
import {
  ArrowKey,
  ARROW_LABELS,
  ANIMATION_TIMINGS,
  ANIMATION_TRANSFORMS,
  ANIMATION_CUBIC_BEZIER,
} from './PurgeModal.constants';
import {
  generateArrowSequence,
  isArrowKey,
  getAscendTransform,
  getAscendDelay,
} from './PurgeModal.utils';

interface PurgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  getThemeColors: () => any;
}

enum PurgeItemStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

interface PurgeItem {
  id: string;
  titleKey: string;
  descKey: string;
  status: PurgeItemStatus;
}

export const PurgeModal: React.FC<PurgeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const { t } = useTranslation();
  const [arrowSequence, setArrowSequence] = useState<ArrowKey[]>([]);
  const [userInput, setUserInput] = useState<ArrowKey[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAscending, setIsAscending] = useState(false);
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(ANIMATION_TIMINGS.SEQUENCE_TIMEOUT);
  const [timerActive, setTimerActive] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [purgeItems, setPurgeItems] = useState<PurgeItem[]>([
    { id: 'liked-posts', titleKey: 'modals.purge.allLikedPosts', descKey: 'modals.purge.allLikedPostsDesc', status: PurgeItemStatus.PENDING },
    { id: 'unliked-archive', titleKey: 'modals.purge.unlikedArchive', descKey: 'modals.purge.unlikedArchiveDesc', status: PurgeItemStatus.PENDING },
    { id: 'prompt-packs', titleKey: 'modals.purge.allPromptPacks', descKey: 'modals.purge.allPromptPacksDesc', status: PurgeItemStatus.PENDING },
  ]);
  const [isPurging, setIsPurging] = useState(false);
  const timerRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);

  // Reset function
  const resetSequence = () => {
    setUserInput([]);
    setTimeRemaining(ANIMATION_TIMINGS.SEQUENCE_TIMEOUT);
    setTimerActive(false);
    setPressedIndex(null);
    setIsFailed(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = null;
  };

  // Generate random arrow sequence when modal opens
  useEffect(() => {
    if (isOpen) {
      setArrowSequence(generateArrowSequence());
      setUserInput([]);
      setIsCompleted(false);
      setIsAscending(false);
      setIsPurging(false);
      setPurgeItems([
        { id: 'liked-posts', titleKey: 'modals.purge.allLikedPosts', descKey: 'modals.purge.allLikedPostsDesc', status: PurgeItemStatus.PENDING },
        { id: 'unliked-archive', titleKey: 'modals.purge.unlikedArchive', descKey: 'modals.purge.unlikedArchiveDesc', status: PurgeItemStatus.PENDING },
        { id: 'prompt-packs', titleKey: 'modals.purge.allPromptPacks', descKey: 'modals.purge.allPromptPacksDesc', status: PurgeItemStatus.PENDING },
      ]);
      resetSequence();
    }
  }, [isOpen]);

  // Timer effect - starts on first keypress
  useEffect(() => {
    if (timerActive && !isCompleted) {
      startTimeRef.current = Date.now();

      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - (startTimeRef.current || Date.now());
        const remaining = Math.max(0, ANIMATION_TIMINGS.SEQUENCE_TIMEOUT - elapsed);

        setTimeRemaining(remaining);

        if (remaining <= 0) {
          // Time's up - reset
          playWrongKeySound();
          setIsFailed(true);
          setTimeout(() => {
            resetSequence();
          }, ANIMATION_TIMINGS.ERROR_RESET_DELAY);
        }
      }, 16); // ~60fps for smooth progress bar

      return () => {
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
        }
      };
    }
  }, [timerActive, isCompleted]);

  // Listen for arrow key presses
  useEffect(() => {
    if (!isOpen || isCompleted) {return;}

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isArrowKey(e.key)) {
        return;
      }

      e.preventDefault();

      // Start timer on first keypress
      if (userInput.length === 0 && !timerActive) {
        setTimerActive(true);
      }

      const currentIndex = userInput.length;
      const isCorrectKey = e.key === arrowSequence[currentIndex];

      // If incorrect key, play sound and reset immediately
      if (!isCorrectKey) {
        playWrongKeySound();
        setPressedIndex(currentIndex);
        setIsFailed(true);
        setTimeout(() => {
          setPressedIndex(null);
          resetSequence();
        }, ANIMATION_TIMINGS.ERROR_RESET_DELAY);
        return;
      }

      // Correct key - continue
      const newInput = [...userInput, e.key];

      // Trigger press animation
      setPressedIndex(currentIndex);
      setTimeout(() => setPressedIndex(null), ANIMATION_TIMINGS.PRESS_ANIMATION_DURATION);

      // Play sound
      playCorrectKeySound();

      setUserInput(newInput);

      // Check if the sequence is complete
      if (newInput.length === arrowSequence.length) {
        playSuccessChord();
        setIsAscending(true);
        setTimerActive(false);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
        }
        setTimeout(() => {
          setIsCompleted(true);
        }, ANIMATION_TIMINGS.COMPLETION_DELAY);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, userInput, arrowSequence, isCompleted, timerActive]);

  const handlePurge = async () => {
    setIsPurging(true);

    // Simulate purging each item with delays
    for (let i = 0; i < purgeItems.length; i++) {
      // Mark current item as in progress
      setPurgeItems(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: PurgeItemStatus.IN_PROGRESS } : item
      ));

      // Simulate deletion delay (you would call actual deletion logic here)
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mark current item as completed
      setPurgeItems(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: PurgeItemStatus.COMPLETED } : item
      ));
    }

    // Wait 2 seconds to show completion status
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Actually purge the data
    onConfirm();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      title={t('modals.purge.title')}
      onClose={onClose}
      getThemeColors={getThemeColors}
      maxWidth="md"
      padding="p-6"
      closeOnOverlayClick={false}
      disableClose={false}
    >
      <div className="flex flex-col gap-4">
        {/* Warning Section */}
        <div
          className="p-4 rounded-lg flex flex-col items-center gap-3"
          style={{
            backgroundColor: '#ef444420',
            border: '2px solid #ef4444',
          }}
        >
          <Icon path={mdiAlertCircle} size={2.5} color="#ef4444" />
          <div className="text-center">
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: '#ef4444' }}
            >
              {t('modals.purge.dangerZone')}
            </h3>
            <p
              className="text-sm"
              style={{ color: colors.TEXT_PRIMARY }}
            >
              {t('modals.purge.warningMessage')}
            </p>
          </div>
        </div>

        {/* What Will Be Deleted */}
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: colors.BACKGROUND_MEDIUM,
            border: `1px solid ${colors.BORDER}`,
          }}
        >
          <ul
            className="text-sm space-y-2"
            style={{ color: colors.TEXT_PRIMARY }}
          >
            {purgeItems.map((item) => {
              const isCompleted = item.status === PurgeItemStatus.COMPLETED;
              const isInProgress = item.status === PurgeItemStatus.IN_PROGRESS;

              return (
                <li key={item.id} className="flex items-start gap-2">
                  <span
                    style={{
                      color: isCompleted ? colors.SUCCESS : isInProgress ? '#f59e0b' : '#ef4444',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {isCompleted ? '✓' : isInProgress ? '⟳' : '•'}
                  </span>
                  <span style={{
                    opacity: isCompleted ? 0.6 : 1,
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    <strong>{t(item.titleKey)}</strong> - {t(item.descKey)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p
          className="text-xs text-center font-bold"
          style={{ color: '#ef4444' }}
        >
          {t('modals.purge.cannotBeUndone')}
        </p>

        {/* Arrow Challenge */}
        {!isCompleted ? (
          <div className="flex flex-col gap-3">
            <div
              className="text-sm text-center p-2 rounded"
              style={{
                backgroundColor: colors.BACKGROUND_MEDIUM,
                color: colors.TEXT_SECONDARY,
              }}
            >
              {t('modals.purge.pressArrowKeys')}
            </div>

            {/* Timer Progress Bar */}
            {timerActive && (
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(timeRemaining / ANIMATION_TIMINGS.SEQUENCE_TIMEOUT) * 100}%`,
                    backgroundColor: timeRemaining < 1000 ? '#ef4444' : colors.SUCCESS,
                    transition: 'width 0.016s linear, background-color 0.3s ease',
                  }}
                />
              </div>
            )}

            {/* Arrow Sequence Display */}
            <div className="flex justify-center gap-2 flex-wrap">
              {arrowSequence.map((arrow, index) => {
                const isEntered = index < userInput.length;
                const isCorrect = isEntered && userInput[index] === arrow;
                const isWrong = isEntered && userInput[index] !== arrow;
                const isBeingPressed = pressedIndex === index;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-center rounded-lg"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: isFailed
                        ? '#ef4444'
                        : isCorrect
                        ? colors.SUCCESS
                        : isWrong
                        ? '#ef4444'
                        : colors.BACKGROUND_MEDIUM,
                      border: `2px solid ${
                        isFailed
                          ? '#ef4444'
                          : isCorrect
                          ? colors.SUCCESS
                          : isWrong
                          ? '#ef4444'
                          : colors.BORDER
                      }`,
                      opacity: isAscending ? 0 : (isEntered || isFailed ? 1 : 0.5),
                      transform: isBeingPressed
                        ? `scale(${ANIMATION_TRANSFORMS.PRESS_SCALE}) rotate(${ANIMATION_TRANSFORMS.PRESS_ROTATION}deg)`
                        : isAscending
                        ? getAscendTransform(
                            index,
                            ANIMATION_TRANSFORMS.ASCEND_BASE_OFFSET,
                            ANIMATION_TRANSFORMS.ASCEND_STAGGER_OFFSET
                          )
                        : 'scale(1) rotate(0deg)',
                      transition: isAscending
                        ? `all ${ANIMATION_TIMINGS.ASCEND_ANIMATION_DURATION / 1000}s ${ANIMATION_CUBIC_BEZIER} ${getAscendDelay(index, ANIMATION_TIMINGS.ASCEND_STAGGER_DELAY)}`
                        : `all ${ANIMATION_TIMINGS.PRESS_ANIMATION_DURATION / 1000}s ease`,
                      boxShadow: isBeingPressed
                        ? `0 0 20px ${isCorrect ? colors.SUCCESS : '#ef4444'}`
                        : 'none',
                    }}
                  >
                    <span
                      className="text-2xl"
                      style={{
                        color: isEntered
                          ? '#fff'
                          : colors.TEXT_SECONDARY,
                        transform: isBeingPressed
                          ? `scale(${ANIMATION_TRANSFORMS.ICON_PRESS_SCALE})`
                          : 'scale(1)',
                        transition: `transform ${ANIMATION_TIMINGS.PRESS_ANIMATION_DURATION / 1000}s ease`,
                      }}
                    >
                      {ARROW_LABELS[arrow]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              className="text-xs text-center"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              {userInput.length === 0 && t('modals.purge.startPressing')}
              {userInput.length > 0 && userInput.length < arrowSequence.length && `${userInput.length} / ${arrowSequence.length}`}
            </div>
          </div>
        ) : (
          <div
            className="text-center p-3 rounded-lg"
            style={{
              backgroundColor: `${colors.SUCCESS}20`,
              border: `1px solid ${colors.SUCCESS}`,
              color: colors.SUCCESS,
            }}
          >
            {t('modals.purge.sequenceComplete')}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-2">
          <Button
            onClick={onClose}
            className="flex-1"
            disabled={isPurging}
            style={{
              opacity: isPurging ? 0.5 : 1,
              cursor: isPurging ? 'not-allowed' : 'pointer',
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handlePurge}
            icon={mdiDelete}
            className="flex-1"
            disabled={!isCompleted || isPurging}
            style={{
              backgroundColor: isCompleted && !isPurging ? colors.DANGER : colors.BACKGROUND_MEDIUM,
              color: isCompleted && !isPurging ? '#fff' : colors.TEXT_SECONDARY,
              opacity: isCompleted && !isPurging ? 1 : 0.5,
              cursor: isCompleted && !isPurging ? 'pointer' : 'not-allowed',
            }}
          >
            {isPurging ? 'Purging...' : t('modals.purge.purgeAllDataButton')}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};
