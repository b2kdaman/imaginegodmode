import React, { useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/inputs/Button';
import { BaseModal } from '@/components/modals/BaseModal';
import {
  mdiPalette,
  mdiCheckCircle,
  mdiFlare,
  mdiStar,
  mdiImageSizeSelectLarge,
  mdiFilmstripBoxMultiple,
  mdiFire,
  mdiFormatListBulletedSquare,
  mdiDownload,
  mdiCog,
  mdiHeart,
  mdiCameraImage,
  mdiWeatherNight,
  mdiPackageVariant,
  mdiMagicStaff,
  mdiMagnify,
} from '@mdi/js';

interface StylePreset {
  id: string;
  label: string;
  modifiers: string;
  icon: string;
}

const STYLE_PRESETS: StylePreset[] = [
  { id: 'safe-pass', label: 'Safe Pass', icon: mdiCheckCircle, modifiers: 'professional photography, editorial style, tasteful composition, high fashion, artistic, magazine quality, no children, no minors' },
  { id: 'beach-photoshoot', label: 'Beach Shoot', icon: mdiFlare, modifiers: 'beach photoshoot, golden hour lighting, elegant swimwear, professional photography, editorial style, wet skin, wind-swept hair, cinematic' },
  { id: 'studio-fashion', label: 'Studio Fashion', icon: mdiPalette, modifiers: 'studio photoshoot, dramatic rim lighting, high fashion editorial, professional photography, magazine cover quality, sharp focus' },
  { id: 'glamour', label: 'Glamour', icon: mdiStar, modifiers: 'glamour photography, soft lighting, elegant pose, beauty editorial, professional makeup, high end fashion, tasteful composition' },
  { id: 'photorealistic', label: 'Photorealistic', icon: mdiImageSizeSelectLarge, modifiers: 'photorealistic, ultra detailed, 8k, high resolution, sharp focus' },
  { id: 'cinematic', label: 'Cinematic', icon: mdiFilmstripBoxMultiple, modifiers: 'cinematic lighting, dramatic shadows, film grain, anamorphic' },
  { id: 'anime', label: 'Anime', icon: mdiFire, modifiers: 'anime style, vibrant colors, cel shading, detailed' },
  { id: 'oil-painting', label: 'Oil Painting', icon: mdiFormatListBulletedSquare, modifiers: 'oil painting style, thick brushstrokes, classical art, masterpiece' },
  { id: 'watercolor', label: 'Watercolor', icon: mdiDownload, modifiers: 'watercolor painting, soft edges, flowing colors, artistic' },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: mdiCog, modifiers: 'cyberpunk style, neon lights, futuristic, dark atmosphere' },
  { id: 'fantasy', label: 'Fantasy', icon: mdiMagicStaff, modifiers: 'fantasy art, magical, ethereal, detailed illustration' },
  { id: 'minimalist', label: 'Minimalist', icon: mdiMagnify, modifiers: 'minimalist style, clean lines, simple, elegant' },
  { id: 'vintage', label: 'Vintage', icon: mdiCameraImage, modifiers: 'vintage photography, film look, nostalgic, warm tones' },
  { id: 'noir', label: 'Noir', icon: mdiWeatherNight, modifiers: 'film noir style, high contrast, black and white, dramatic' },
  { id: 'pop-art', label: 'Pop Art', icon: mdiPackageVariant, modifiers: 'pop art style, bold colors, comic book, vibrant' },
  { id: 'surreal', label: 'Surreal', icon: mdiHeart, modifiers: 'surrealist style, dreamlike, abstract, imaginative' },
];

interface StylePresetsProps {
  onApply: (modifiers: string) => void;
}

export const StylePresets: React.FC<StylePresetsProps> = ({ onApply }) => {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePresetClick = (preset: StylePreset) => {
    onApply(preset.modifiers);
    setIsModalOpen(false);
  };

  return (
    <div className="mt-2">
      <Button
        onClick={() => setIsModalOpen(true)}
        icon={mdiPalette}
        className="w-full text-sm"
        tooltip="Open style presets"
      >
        Style Presets
      </Button>

      <BaseModal
        isOpen={isModalOpen}
        title="Style Presets"
        onClose={() => setIsModalOpen(false)}
        getThemeColors={getThemeColors}
        maxWidth="md"
        maxHeight="88vh"
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setIsModalOpen(false)} className="text-xs">
              Close
            </Button>
          </div>
        }
      >
        <div
          className="grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar pr-1"
          style={{
            maxHeight: '72vh',
          }}
        >
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="w-full px-3 py-2 text-left text-sm cursor-pointer transition-all duration-200 rounded-lg flex items-center gap-2"
              style={{
                backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
                color: colors.TEXT_PRIMARY,
                border: `1px solid ${colors.BORDER}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.BACKGROUND_LIGHT;
                e.currentTarget.style.color = colors.TEXT_HOVER || colors.TEXT_PRIMARY;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
                e.currentTarget.style.color = colors.TEXT_PRIMARY;
              }}
            >
              <Icon path={preset.icon} size={0.7} color={colors.TEXT_SECONDARY} />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </BaseModal>
    </div>
  );
};
