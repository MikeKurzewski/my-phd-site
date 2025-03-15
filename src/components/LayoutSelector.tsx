import React, { useState } from 'react';
import { useSubscriptionLimits } from '../lib/useSubscriptionLimits';
import PlanLimitModal from './PlanLimitModal';
import { Layout, Layers, Lock } from 'lucide-react';

interface LayoutSelectorProps {
  currentLayout: string;
  onChange: (layout: string) => void;
}

interface LayoutOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isPro: boolean;
}

const layoutOptions: LayoutOption[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'A clean and simple layout with sidebar navigation',
    icon: <Layout className="h-6 w-6" />,
    isPro: false
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'A professional layout ideal for researchers and academics',
    icon: <Layers className="h-6 w-6" />,
    isPro: true
  }
];

export default function LayoutSelector({ currentLayout, onChange }: LayoutSelectorProps) {
  const { isPro, limits } = useSubscriptionLimits();
  const [showModal, setShowModal] = useState(false);
  const [selectedProLayout, setSelectedProLayout] = useState<string | null>(null);

  const handleLayoutClick = (layout: LayoutOption) => {
    if (layout.isPro && !isPro) {
      setSelectedProLayout(layout.id);
      setShowModal(true);
    } else {
      onChange(layout.id);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProLayout(null);
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">Layout</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {layoutOptions.map((layout) => {
          const isAvailable = isPro || limits.availableLayouts.includes(layout.id);
          const isActive = currentLayout === layout.id;
          
          return (
            <div
              key={layout.id}
              className={`p-4 rounded-lg border ${
                isActive
                  ? 'border-[rgb(var(--color-primary-400))] bg-[rgb(var(--color-primary-900))] bg-opacity-20'
                  : 'border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]'
              } cursor-pointer relative`}
              onClick={() => handleLayoutClick(layout)}
            >
              <div className="flex items-start space-x-4">
                <div className="text-[rgb(var(--color-primary-400))]">
                  {layout.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-[rgb(var(--color-text-primary))]">{layout.name}</h4>
                    {layout.isPro && !isPro && (
                      <Lock className="h-4 w-4 text-[rgb(var(--color-text-tertiary))]" />
                    )}
                  </div>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    {layout.description}
                  </p>
                </div>
              </div>
              {layout.isPro && !isPro && (
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
          feature="Premium layouts"
        />
      )}
    </div>
  );
}
