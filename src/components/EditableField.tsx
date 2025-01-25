import { Upload } from "lucide-react";
import { useState, useEffect } from "react";

interface EditableFieldProps {
  type: 'text' | 'textarea' | 'image' | 'file';
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  label?: string;
  getFileUrl?: (path: string) => string;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  type,
  value,
  isEditing,
  onChange,
  label,
  getFileUrl
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Update local value if local prop change
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  if (type === 'image') {
    return (
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-square relative rounded-lg overflow-hidden">
          {value && getFileUrl ? (
            <img
              src={getFileUrl(value)}
              alt={label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[rgb(var(--color-bg-tertiary))] flex items-center justify-center">
              <span className="text-4xl text-[rgb(var(--color-text-tertiary))]">
                {label?.[0]}
              </span>
            </div>
          )}
          {isEditing && isHovered && (
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
                      onChange(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'textarea') {
    const showEdit = isEditing && isHovered;
    return (
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {showEdit ? (
          <textarea
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              onChange(e.target.value);
            }}
            className="w-full p-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-md"
            rows={4}
          />
        ) : (
          <div className="whitespace-pre-wrap">{isEditing ? localValue : value}</div>
        )}
      </div>
    );
  }

  // For text input
  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
        onChange(e.target.value)
      }}
      className="w-full p-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-md"
    />
  );
};
