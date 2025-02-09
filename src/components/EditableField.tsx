import { Upload } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface EditableFieldProps {
  type: 'text' | 'textarea' | 'image' | 'file';
  value: string;
  isEditing: boolean;
  onChange: (value: string | File) => void;
  label?: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  type,
  value = '',
  isEditing,
  onChange,
  label,
  children,
  isLoading
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const renderEditOverlay = () => {
    if (!isEditing) return null;
    if (type !== 'image' && !isHovered && !isFocused) return null;

    switch (type) {
      case 'image':
        const handleFileClick = () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            console.log('File input change event triggered');
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              console.log('File selected:', file);
              onChange(file);
            }
          };
          input.click();
        };

        return isHovered ? (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <button
              onClick={handleFileClick}
              className="cursor-pointer text-white flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Change {label}
            </button>
          </div>
        ) : null;

      case 'textarea':
        return (
          <div className="absolute inset-0">
            <textarea
              ref={textareaRef}
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                setIsHovered(false);
              }}
              className="w-full h-full min-h-[200px] p-4 bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))]
                        border border-[rgb(var(--color-primary-400))] rounded-lg resize-none focus:outline-none
                        focus:ring-2 focus:ring-[rgb(var(--color-primary-400))] focus:border-transparent"
              placeholder="Write something about yourself..."
              style={{ lineHeight: '1.5' }}
            />
          </div>
        );

      case 'text':
        return (
          <div className="absolute inset-0">
            <input
              type="text"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                setIsHovered(false);
              }}
              className="w-full h-full p-4 bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))]
                        border border-[rgb(var(--color-primary-400))] rounded-lg focus:outline-none
                        focus:ring-2 focus:ring-[rgb(var(--color-primary-400))] focus:border-transparent"
              placeholder="Enter text here..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderContent = () => {
    if (!isEditing) {
      return (
        <div className="whitespace-pre-wrap">
          {children}
        </div>
      );
    }

    if ((type === 'text' || type === 'textarea') && !isHovered && !isFocused) {
      return (
        <div className="min-h-[1.5em] p-4 text-[rgb(var(--color-text-primary))] whitespace-pre-wrap">
          {localValue || <span className="text-[rgb(var(--color-text-tertiary))] italic">Click to edit...</span>}
        </div>
      );
    }

    return children;
  };

  return (
    <div
      className={`relative rounded-lg transition-all duration-200 ${isEditing && !isFocused ? 'hover:bg-[rgb(var(--color-bg-secondary))] cursor-text' : ''
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isFocused && setIsHovered(false)}
    >
      {renderContent()}
      {renderEditOverlay()}
    </div>
  );
};
