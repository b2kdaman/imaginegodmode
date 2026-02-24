import React, { useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Icon } from '@/components/common/Icon';
import { mdiPalette, mdiPlus, mdiChevronDown, mdiChevronUp } from '@mdi/js';

interface StylePreset {
  id: string;
  label: string;
  modifiers: string;
}

const STYLE_PRESETS: StylePreset[] = [
  { id: 'safe-pass', label: 'Safe Pass', modifiers: 'professional photography, editorial style, tasteful composition, high fashion, artistic, magazine quality, no children, no minors' },
  { id: 'beach-photoshoot', label: 'Beach Shoot', modifiers: 'beach photoshoot, golden hour lighting, elegant swimwear, professional photography, editorial style, wet skin, wind-swept hair, cinematic' },
  { id: 'studio-fashion', label: 'Studio Fashion', modifiers: 'studio photoshoot, dramatic rim lighting, high fashion editorial, professional photography, magazine cover quality, sharp focus' },
  { id: 'glamour', label: 'Glamour', modifiers: 'glamour photography, soft lighting, elegant pose, beauty editorial, professional makeup, high end fashion, tasteful composition' },
  { id: 'photorealistic', label: 'Photorealistic', modifiers: 'photorealistic, ultra detailed, 8k, high resolution, sharp focus' },
  { id: 'cinematic', label: 'Cinematic', modifiers: 'cinematic lighting, dramatic shadows, film grain, anamorphic' },
  { id: 'anime', label: 'Anime', modifiers: 'anime style, vibrant colors, cel shading, detailed' },
  { id: 'oil-painting', label: 'Oil Painting', modifiers: 'oil painting style, thick brushstrokes, classical art, masterpiece' },
  { id: 'watercolor', label: 'Watercolor', modifiers: 'watercolor painting, soft edges, flowing colors, artistic' },
  { id: 'cyberpunk', label: 'Cyberpunk', modifiers: 'cyberpunk style, neon lights, futuristic, dark atmosphere' },
  { id: 'fantasy', label: 'Fantasy', modifiers: 'fantasy art, magical, ethereal, detailed illustration' },
  { id: 'minimalist', label: 'Minimalist', modifiers: 'minimalist style, clean lines, simple, elegant' },
  { id: 'vintage', label: 'Vintage', modifiers: 'vintage photography, film look, nostalgic, warm tones' },
  { id: 'noir', label: 'Noir', modifiers: 'film noir style, high contrast, black and white, dramatic' },
  { id: 'pop-art', label: 'Pop Art', modifiers: 'pop art style, bold colors, comic book, vibrant' },
  { id: 'surreal', label: 'Surreal', modifiers: 'surrealist style, dreamlike, abstract, imaginative' },
];

interface StylePresetsProps {
  onApply: (modifiers: string) => void;
}

export const StylePresets: React.FC<StylePresetsProps> = ({ onApply }) => {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (preset: StylePreset) => {
    onApply(preset.modifiers);
    setIsOpen(false);
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-1 rounded text-xs"
        style={{
          backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
          color: colors.TEXT_SECONDARY,
          border: `1px solid ${colors.BORDER}`,
        }}
      >
        <div className="flex items-center gap-1">
          <Icon path={mdiPalette} size={0.6} />
          <span>Style Presets</span>
        </div>
        <Icon path={isOpen ? mdiChevronUp : mdiChevronDown} size={0.6} />
      </button>

      {isOpen && (
        <div
          className="mt-1 p-2 rounded max-h-40 overflow-y-auto custom-scrollbar"
          style={{
            backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
            border: `1px solid ${colors.BORDER}`,
          }}
        >
          <div className="grid grid-cols-2 gap-1">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-left hover:opacity-80"
                style={{
                  backgroundColor: `${colors.BACKGROUND_LIGHT}50`,
                  color: colors.TEXT_PRIMARY,
                }}
              >
                <Icon path={mdiPlus} size={0.5} />
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
