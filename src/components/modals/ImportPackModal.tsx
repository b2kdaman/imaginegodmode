/**
 * Modal component for importing pack with paste or file upload
 */

import React, { useState, useRef } from 'react';
import { Button } from '../inputs/Button';
import { mdiUpload, mdiContentPaste, mdiCheckCircle, mdiAlertCircle } from '@mdi/js';
import { Icon } from '../common/Icon';
import { useTranslation } from '@/contexts/I18nContext';
import { BaseModal } from './BaseModal';

interface ImportPackModalProps {
  isOpen: boolean;
  importMode: 'add' | 'replace';
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  getThemeColors: () => any;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  packName?: string;
  promptCount?: number;
  jsonText?: string;
}

export const ImportPackModal: React.FC<ImportPackModalProps> = ({
  isOpen,
  importMode: _importMode,
  onClose,
  onImport,
  getThemeColors,
}) => {
  const colors = getThemeColors();
  const { t } = useTranslation();
  const [jsonInput, setJsonInput] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validateJSON = (text: string): ValidationResult => {
    if (!text.trim()) {
      return { isValid: false, error: 'No JSON provided' };
    }

    try {
      const data = JSON.parse(text);

      // Validate structure
      if (typeof data.version !== 'string') {
        return { isValid: false, error: 'Missing or invalid "version" field' };
      }
      if (typeof data.packName !== 'string' || !data.packName.trim()) {
        return { isValid: false, error: 'Missing or invalid "packName" field' };
      }
      if (!Array.isArray(data.prompts)) {
        return { isValid: false, error: '"prompts" must be an array' };
      }

      // Validate prompts
      for (let i = 0; i < data.prompts.length; i++) {
        const prompt = data.prompts[i];
        if (typeof prompt.text !== 'string') {
          return { isValid: false, error: `Prompt ${i + 1}: missing or invalid "text"` };
        }
        if (typeof prompt.rating !== 'number' || prompt.rating < 0 || prompt.rating > 5) {
          return { isValid: false, error: `Prompt ${i + 1}: "rating" must be 0-5` };
        }
      }

      return {
        isValid: true,
        packName: data.packName,
        promptCount: data.prompts.length,
        jsonText: text,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid JSON format',
      };
    }
  };

  const decodeBase64ToJson = (base64String: string): unknown => {
    try {
      const decodedString = decodeURIComponent(escape(atob(base64String)));
      return JSON.parse(decodedString);
    } catch (error) {
      throw new Error('Invalid base64 or JSON format');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
      const result = validateJSON(text);
      setValidation(result);
    } catch (error) {
      setValidation({
        isValid: false,
        error: 'Failed to read clipboard',
      });
    }
  };

  const handleTextChange = (text: string) => {
    setJsonInput(text);
    if (text.trim()) {
      const result = validateJSON(text);
      setValidation(result);
    } else {
      setValidation(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let jsonText: string;

        // Check if file is .pak (base64 encoded)
        if (file.name.endsWith('.pak')) {
          try {
            const decoded = decodeBase64ToJson(content);
            jsonText = JSON.stringify(decoded, null, 2);
          } catch (error) {
            setValidation({
              isValid: false,
              error: 'Invalid .pak file format. File must contain base64 encoded JSON.'
            });
            return;
          }
        } else {
          // Assume it's raw JSON
          jsonText = content;
        }

        setJsonInput(jsonText);
        const result = validateJSON(jsonText);
        setValidation(result);
      } catch (error) {
        setValidation({
          isValid: false,
          error: error instanceof Error ? error.message : 'Failed to process file'
        });
      }
    };
    reader.onerror = () => {
      setValidation({ isValid: false, error: 'Failed to read file' });
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!validation?.isValid || !validation.jsonText) return;

    setIsImporting(true);
    try {
      // Create a temporary file from the JSON text
      const blob = new Blob([validation.jsonText], { type: 'application/json' });
      const file = new File([blob], 'import.json', { type: 'application/json' });

      await onImport(file);

      // Reset and close on success
      setJsonInput('');
      setValidation(null);
      onClose();
    } catch (error) {
      setValidation({
        ...validation,
        isValid: false,
        error: error instanceof Error ? error.message : 'Import failed',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setJsonInput('');
    setValidation(null);
    onClose();
  };

  const lineCount = jsonInput.split('\n').length;

  return (
    <BaseModal
      isOpen={isOpen}
      title={t('modals.importPack.title')}
      onClose={handleClose}
      getThemeColors={getThemeColors}
      maxWidth="md"
      footer={
        <div className="flex gap-2 justify-end">
          <Button onClick={handleClose}>{t('common.cancel')}</Button>
          <Button
            onClick={handleImport}
            disabled={!validation?.isValid || isImporting}
            style={{
              backgroundColor: validation?.isValid ? colors.SUCCESS : undefined,
              color: validation?.isValid ? '#fff' : undefined,
              opacity: !validation?.isValid || isImporting ? 0.5 : 1,
            }}
          >
            {isImporting ? t('modals.importPack.importing') : t('common.import')}
          </Button>
        </div>
      }
    >
      <>
        {/* Action Buttons */}
        <div className="flex gap-2 mb-3">
          <Button
            onClick={handlePaste}
            icon={mdiContentPaste}
            className="flex-1"
            tooltip="Paste JSON from clipboard"
          >
            {t('common.paste')}
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            icon={mdiUpload}
            className="flex-1"
            tooltip="Select JSON file"
          >
            {t('modals.importPack.selectFile')}
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pak,.json"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* JSON Input Area */}
        <div className="mb-3">
          <textarea
            ref={textareaRef}
            value={jsonInput}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Paste JSON here or click buttons above..."
            className="w-full h-32 px-3 py-2 rounded-lg text-xs font-mono resize-none"
            style={{
              backgroundColor: colors.BACKGROUND_MEDIUM,
              color: colors.TEXT_PRIMARY,
              border: `1px solid ${colors.BORDER}`,
            }}
          />
          {jsonInput && (
            <div
              className="text-xs mt-1"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              {lineCount} line{lineCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Validation Result */}
        {validation && (
          <div
            className="mb-3 p-3 rounded-lg flex items-start gap-2"
            style={{
              backgroundColor: validation.isValid
                ? `${colors.SUCCESS}20`
                : `${colors.BACKGROUND_MEDIUM}`,
              border: `1px solid ${
                validation.isValid ? colors.SUCCESS : colors.BORDER
              }`,
            }}
          >
            <Icon
              path={validation.isValid ? mdiCheckCircle : mdiAlertCircle}
              size={0.7}
              color={validation.isValid ? colors.SUCCESS : colors.TEXT_SECONDARY}
            />
            <div className="flex-1">
              {validation.isValid ? (
                <div className="text-xs">
                  <div
                    className="font-semibold mb-1"
                    style={{ color: colors.SUCCESS }}
                  >
                    {t('modals.importPack.validJson')}
                  </div>
                  <div style={{ color: colors.TEXT_SECONDARY }}>
                    Pack: <span style={{ color: colors.TEXT_PRIMARY }}>{validation.packName}</span>
                  </div>
                  <div style={{ color: colors.TEXT_SECONDARY }}>
                    Prompts: <span style={{ color: colors.TEXT_PRIMARY }}>{validation.promptCount}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs">
                  <div
                    className="font-semibold mb-1"
                    style={{ color: colors.TEXT_SECONDARY }}
                  >
                    {t('modals.importPack.invalidJson')}
                  </div>
                  <div style={{ color: colors.TEXT_SECONDARY }}>
                    {validation.error}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </>
    </BaseModal>
  );
};
