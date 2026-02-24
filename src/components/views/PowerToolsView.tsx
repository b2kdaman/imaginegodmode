import React from 'react';
import { usePowerToolsStore } from '@/store/usePowerToolsStore';
import { useAutoRetry } from '@/hooks/useAutoRetry';
import { useSettingsStore } from '@/store/useSettingsStore';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  return (
    <div className="mb-3">
      <div className="text-xs font-semibold uppercase tracking-widest mb-1 px-1" style={{ color: colors.TEXT_SECONDARY }}>
        {title}
      </div>
      <div className="rounded-lg p-2 space-y-2" style={{ backgroundColor: colors.BACKGROUND_MEDIUM, border: `1px solid ${colors.BORDER}` }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span style={{ color: colors.TEXT_SECONDARY }}>{label}</span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

function StatusBadge({ text }: { text: string }) {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const isGood = text.startsWith('✅');
  const isBad = text.toLowerCase().includes('stop') || text.toLowerCase().includes('not found');
  const isCountdown = text.includes('retrying in');
  return (
    <div
      className="text-xs px-2 py-0.5 rounded font-mono truncate w-full"
      style={{
        backgroundColor: isGood
          ? `${colors.SUCCESS}22`
          : isBad
          ? `${colors.DANGER}22`
          : isCountdown
          ? `${colors.GLOW_PRIMARY}22`
          : colors.BACKGROUND_LIGHT,
        color: isGood
          ? colors.SUCCESS
          : isBad
          ? colors.DANGER
          : isCountdown
          ? colors.GLOW_PRIMARY
          : colors.TEXT_SECONDARY,
        border: `1px solid ${isGood ? colors.SUCCESS : isBad ? colors.DANGER : colors.BORDER}44`,
      }}
    >
      {text}
    </div>
  );
}

function NumInput({ value, onChange, min = 1, max = 9999 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-16 text-center text-xs rounded px-1 py-0.5 focus:outline-none"
      style={{ backgroundColor: colors.BACKGROUND_LIGHT, border: `1px solid ${colors.BORDER}`, color: colors.TEXT_PRIMARY }}
    />
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-4 w-8 items-center rounded-full transition-colors"
      style={{ backgroundColor: checked ? colors.SUCCESS : colors.BACKGROUND_LIGHT }}
    >
      <span
        className="inline-block h-3 w-3 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

function StatusDot({ active, watching }: { active: boolean; watching: boolean }) {
  const color = active ? '#ef4444' : watching ? '#f59e0b' : '#6b7280';
  const label = active ? 'Retrying' : watching ? 'Watching' : 'Off';
  return (
    <div className="flex items-center gap-1 text-xs" style={{ color }}>
      <span
        className={active || watching ? 'animate-pulse' : ''}
        style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: active || watching ? `0 0 6px ${color}` : 'none',
        }}
      />
      <span style={{ fontSize: 10 }}>{label}</span>
    </div>
  );
}

function CooldownBar({ remaining, total }: { remaining: number; total: number }) {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  if (remaining <= 0) { return null; }
  const pct = (remaining / total) * 100;
  return (
    <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: colors.BACKGROUND_LIGHT }}>
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${pct}%`, backgroundColor: colors.DANGER }}
      />
    </div>
  );
}

export const PowerToolsView: React.FC = () => {
  useAutoRetry();

  const {
    autoRetryEnabled, maxRetries, cooldownSeconds,
    retryCount, retryStatus, cooldownRemaining,
    setAutoRetryEnabled, setMaxRetries, setCooldownSeconds, setRetryCount,
    videoGoalTarget, videoGoalCurrent, videoGoalStatus,
    setVideoGoalTarget, setVideoGoalCurrent,
  } = usePowerToolsStore();

  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const isRetrying = cooldownRemaining > 0;
  const isWatching = autoRetryEnabled && !isRetrying;

  const handleToggle = (enabled: boolean) => {
    setAutoRetryEnabled(enabled);
    if (!enabled) {
      setRetryCount(0);
      setVideoGoalCurrent(0);
    }
  };

  const handleReset = () => {
    setRetryCount(0);
    setVideoGoalCurrent(0);
  };

  return (
    <div className="overflow-y-auto space-y-1 text-xs" style={{ color: colors.TEXT_PRIMARY }}>

      <Section title="Auto-Retry + Video Goal">
        <div className="flex items-center justify-between">
          <StatusDot active={isRetrying} watching={isWatching} />
          <span className="text-xs font-mono" style={{ color: colors.TEXT_SECONDARY }}>
            {retryCount} retries | {videoGoalCurrent}/{videoGoalTarget} videos
          </span>
        </div>

        <Row label="Enable">
          <ToggleSwitch
            checked={autoRetryEnabled}
            onChange={handleToggle}
          />
        </Row>

        <Row label="Max Retries">
          <NumInput value={maxRetries} onChange={setMaxRetries} min={1} max={9999} />
        </Row>

        <Row label="Cooldown (sec)">
          <NumInput value={cooldownSeconds} onChange={setCooldownSeconds} min={1} max={60} />
        </Row>

        <Row label="Video Goal">
          <NumInput value={videoGoalTarget} onChange={setVideoGoalTarget} min={1} max={500} />
        </Row>

        <Row label="Progress">
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.BACKGROUND_LIGHT }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (videoGoalCurrent / Math.max(1, videoGoalTarget)) * 100)}%`,
                  backgroundColor: colors.PROGRESS_BAR,
                }}
              />
            </div>
            <span className="font-mono text-xs">{videoGoalCurrent}/{videoGoalTarget}</span>
            {(retryCount > 0 || videoGoalCurrent > 0) && !autoRetryEnabled && (
              <button
                onClick={handleReset}
                className="text-xs"
                style={{ color: colors.TEXT_SECONDARY }}
                title="Reset"
              >↺</button>
            )}
          </div>
        </Row>

        {cooldownRemaining > 0 && (
          <CooldownBar remaining={cooldownRemaining} total={cooldownSeconds} />
        )}

        <StatusBadge text={retryStatus !== 'Idle' ? retryStatus : videoGoalStatus} />
      </Section>

    </div>
  );
};

export default PowerToolsView;
