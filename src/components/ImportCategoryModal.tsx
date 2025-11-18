/**
 * Modal component for importing category with paste or file upload
 */

import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { mdiClose, mdiUpload, mdiContentPaste, mdiCheckCircle, mdiAlertCircle } from '@mdi/js';
import { Icon } from './Icon';

interface ImportCategoryModalProps {
  isOpen: boolean;
  importMode: 'add' | 'replace';
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  getThemeColors: () => any;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  categoryName?: string;
  promptCount?: number;
  jsonText?: string;
}

export const ImportCategoryModal: React.FC<ImportCategoryModalProps> = ({
  isOpen,
  importMode,
  onClose,
  onImport,
  getThemeColors,
}) => {
  const colors = getThemeColors();
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
      if (typeof data.categoryName !== 'string' || !data.categoryName.trim()) {
        return { isValid: false, error: 'Missing or invalid "categoryName" field' };
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
        categoryName: data.categoryName,
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
      const text = event.target?.result as string;
      setJsonInput(text);
      const result = validateJSON(text);
      setValidation(result);
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={handleClose}
    >
      <div
        className="rounded-xl p-4 max-w-md w-full mx-4"
        style={{
          backgroundColor: colors.BACKGROUND_DARK,
          border: `1px solid ${colors.BORDER}`,
          boxShadow: `0 8px 32px ${colors.SHADOW}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-sm font-semibold"
            style={{ color: colors.TEXT_PRIMARY }}
          >
            Import Category ({importMode} mode)
          </h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: colors.TEXT_SECONDARY,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
              e.currentTarget.style.color = colors.TEXT_PRIMARY;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.TEXT_SECONDARY;
            }}
          >
            <Icon path={mdiClose} size={0.8} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-3">
          <Button
            onClick={handlePaste}
            icon={mdiContentPaste}
            className="flex-1"
            tooltip="Paste JSON from clipboard"
          >
            Paste
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            icon={mdiUpload}
            className="flex-1"
            tooltip="Select JSON file"
          >
            Select File
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
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
                    Valid JSON
                  </div>
                  <div style={{ color: colors.TEXT_SECONDARY }}>
                    Category: <span style={{ color: colors.TEXT_PRIMARY }}>{validation.categoryName}</span>
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
                    Invalid JSON
                  </div>
                  <div style={{ color: colors.TEXT_SECONDARY }}>
                    {validation.error}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 justify-end">
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleImport}
            disabled={!validation?.isValid || isImporting}
            style={{
              backgroundColor: validation?.isValid ? colors.SUCCESS : undefined,
              color: validation?.isValid ? '#fff' : undefined,
              opacity: !validation?.isValid || isImporting ? 0.5 : 1,
            }}
          >
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </div>
      </div>
    </div>
  );
};
