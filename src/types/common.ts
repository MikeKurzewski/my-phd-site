// src/types/common.ts
export interface TabProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}
