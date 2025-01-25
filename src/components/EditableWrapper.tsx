import { EditableField } from './EditableField';

interface EditableWrapperProps {
  isEditing: boolean;
  children: React.ReactNode;
  onEdit: (value: string) => void;
  type: 'text' | 'textarea' | 'image';
  value: string;
  label?: string;
  getFileUrl?: (path: string, bucket: string) => string;
}

export const EditableWrapper = ({
  isEditing,
  children,
  onEdit,
  type,
  value,
  label,
  getFileUrl
}: EditableWrapperProps) => {
  if (!isEditing) {
    return <>{children}</>;
  }

  return (
    <EditableField
      type={type}
      value={value}
      isEditing={isEditing}
      onChange={onEdit}
      label={label}
      getFileUrl={getFileUrl}
    />
  );
}
