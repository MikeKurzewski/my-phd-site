import { Edit2, Upload } from "lucide-react";
import { useState } from "react";

interface EditableFieldProps {
  type: 'text' | 'textarea' | 'image' | 'file';
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  label?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  type,
  value,
  isEditing,
  onChange,
  label
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const renderEditIcon = () => (
    <div className="absolute -right-4 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <Edit2 className="h-4 w-4 text-[rgb(var(--color-primary-400))]" />
    </div>
  );

  if (type === 'text' || type === 'textarea') {
    return (
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isEditing ? (
          type === 'text' ? (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="form-input w-full"
            />
          ) : (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="form-textarea w-full"
              rows={4}
            />
          )
        ) : (
          <div className="relative">
            {value}
            {isHovered && isEditing && renderEditIcon()}
          </div>
        )}
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isEditing && isHovered ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
            <label className="cursor-pointer text-white flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Change {label || 'Image'}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Will Add upload logic here...
                  }
                }}
              />
            </label>
          </div>
        ) : null}
        <img
          src={value}
          alt={label}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return null;
};
