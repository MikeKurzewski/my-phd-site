import React, { useState } from 'react';
import { useSubscriptionLimits } from '../lib/useSubscriptionLimits';
import PlanLimitModal from './PlanLimitModal';
import { Lock } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: string;
  onChange: (theme: string) => void;
}

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  isPro: boolean;
}

const themeOptions: ThemeOption[] = [
  {
    id: 'dark-teal',
    name: 'Dark Teal',
    description: 'A professional dark theme with teal accents',
    isPro: false
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'A clean, minimalist theme with focus on content',
    isPro: false
  },
  {
    id: 'light-teal',
    name: 'Light Teal',
    description: 'A bright theme with teal accents',
    isPro: true
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    description: 'A dark theme with blue accents',
    isPro: true
  },
  {
    id: 'light-blue',
    name: 'Light Blue',
    description: 'A light theme with blue accents',
    isPro: true
  }
];

export default function ThemeSelector({ currentTheme, onChange }: ThemeSelectorProps) {
  const { isPro, limits } = useSubscriptionLimits();
  const [showModal, setShowModal] = useState(false);
  const [selectedProTheme, setSelectedProTheme] = useState<string | null>(null);

  const handleThemeClick = (theme: ThemeOption) => {
    if (theme.isPro && !isPro) {
      setSelectedProTheme(theme.id);
      setShowModal(true);
    } else {
      onChange(theme.id);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProTheme(null);
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">Theme</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themeOptions.map((theme) => {
          const isAvailable = isPro || limits.availableThemes.includes(theme.id);
          const isActive = currentTheme === theme.id;
          
          return (
            <div
              key={theme.id}
              className={`p-4 rounded-lg border ${
                isActive
                  ? 'border-[rgb(var(--color-primary-400))] bg-[rgb(var(--color-primary-900))] bg-opacity-20'
                  : 'border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]'
              } cursor-pointer relative`}
              onClick={() => handleThemeClick(theme)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-[rgb(var(--color-text-primary))]">{theme.name}</h4>
                {theme.isPro && !isPro && (
                  <Lock className="h-4 w-4 text-[rgb(var(--color-text-tertiary))]" />
                )}
              </div>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {theme.description}
              </p>
              {theme.isPro && !isPro && (
                <div className="absolute inset-0 bg-[rgb(var(--color-bg-secondary))] bg-opacity-60 flex items-center justify-center rounded-lg">
                  <span className="text-xs font-medium bg-[rgb(var(--color-primary-400))] text-white px-2 py-1 rounded">
                    PRO
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <PlanLimitModal
          isOpen={showModal}
          onClose={closeModal}
          feature="Premium themes"
        />
      )}
    </div>
  );
}
