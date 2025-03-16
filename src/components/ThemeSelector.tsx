import React, { useState } from 'react';
import { useSubscriptionLimits } from '../lib/useSubscriptionLimits';
import PlanLimitModal from './PlanLimitModal';
import { Lock, Sun, Moon } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: string;
  onChange: (theme: string) => void;
}

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  isPro: boolean;
  icon: React.ReactNode;
}

const themeOptions: ThemeOption[] = [
  {
    id: 'dark-teal',
    name: 'Dark Teal',
    description: 'A professional dark theme with teal accents',
    isPro: false,
    icon: <Moon className="h-5 w-5" />
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'A clean, minimalist theme with focus on content',
    isPro: false,
    icon: <Moon className="h-5 w-5" />
  },
  // These themes are temporarily disabled until they're improved
  /*
  {
    id: 'light-teal',
    name: 'Light Teal',
    description: 'A bright theme with teal accents',
    isPro: true,
    icon: <Sun className="h-5 w-5" />
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    description: 'A dark theme with blue accents',
    isPro: true,
    icon: <Moon className="h-5 w-5" />
  },
  {
    id: 'light-blue',
    name: 'Light Blue',
    description: 'A light theme with blue accents',
    isPro: true,
    icon: <Sun className="h-5 w-5" />
  }
  */
];

export default function ThemeSelector({ currentTheme, onChange }: ThemeSelectorProps) {
  const { isPro, limits, loading } = useSubscriptionLimits();
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
      <div className="flex flex-wrap items-center gap-4">
        {themeOptions.map((theme) => {
          const isAvailable = !theme.isPro || isPro;
          const isActive = currentTheme === theme.id;
          
          return (
            <button
              key={theme.id}
              onClick={() => handleThemeClick(theme)}
              disabled={theme.isPro && !isPro}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors relative ${
                isActive
                  ? 'bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-400))]'
                  : theme.isPro && !isPro
                    ? 'text-[rgb(var(--color-text-tertiary))] bg-[rgb(var(--color-bg-tertiary))] opacity-60 cursor-not-allowed'
                    : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))]'
              }`}
            >
              {theme.icon}
              {theme.name}
              {theme.isPro && !isPro && (
                <Lock className="h-4 w-4 ml-1" />
              )}
            </button>
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
