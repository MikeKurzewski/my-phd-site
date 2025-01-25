import { Upload } from "lucide-react";
import { useEffect, useState } from "react";

interface EditableFieldProps {
  type: 'text' | 'textarea' | 'image' | 'file';
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  label?: string;
  children: React.ReactNode;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  type,
  value,
  isEditing,
  onChange,
  label,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const renderEditOverlay = () => {
    if (!isEditing) return null;
    if (type !== 'image' && !isHovered) return null;

    switch (type) {
      case 'image':
        return isHovered ? (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <label className="cursor-pointer text-white flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Change {label}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange(file.name); // Handle file upload separately.
                  }
                }}
              />
            </label>
          </div>
        ) : null;

      case 'textarea':
        return (
          <div className="absolute inset-0">
            <input
              type="text"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full h-full p-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-md"
              style={{ minHeight: '100%' }}
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
              className="w-full h-full p-2"
            />
          </div>
        );
      case 'file':
        // TODO: Implement
        return null;
      default:
        // TODO: Implement
        return null;
    }
  };

  const renderContent = () => {
    if (!isEditing) return children;

    // for text/textarea we show edited content when not hovering
    if ((type === 'text' || type === 'textarea') && !isHovered) {
      return <div className="white-space-pre-wrap">{localValue}</div>;
    }

    return children;
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderContent()}
      {renderEditOverlay()}
    </div>
  );
};
