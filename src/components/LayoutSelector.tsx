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
    description: 'A clean and simple layout with a minimalistic design',
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
  const { isPro, limits, loading } = useSubscriptionLimits();
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {layoutOptions.map((layout) => {
          const isAvailable = !layout.isPro || isPro;
          const isActive = currentLayout === layout.id;

          return (
            <div
              key={layout.id}
              className={`p-4 rounded-lg border ${
                isActive
                  ? 'border-[rgb(var(--color-primary-400))] bg-[rgb(var(--color-primary-900))] bg-opacity-20'
                  : 'border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]'
              } ${layout.isPro && !isPro ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} relative`}
              onClick={() => isAvailable && handleLayoutClick(layout)}
            >
              <div className="flex items-start space-x-4">
                <div className={`${isActive || !layout.isPro || isPro ? 'text-[rgb(var(--color-primary-400))]' : 'text-[rgb(var(--color-text-tertiary))]'}`}>
                  {layout.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${isActive || !layout.isPro || isPro ? 'text-[rgb(var(--color-text-primary))]' : 'text-[rgb(var(--color-text-tertiary))]'}`}>
                      {layout.name}
                    </h4>
                    {layout.isPro && !isPro && (
                      <Lock className="h-4 w-4 text-[rgb(var(--color-text-tertiary))]" />
                    )}
                  </div>
                  <p className={`text-sm ${isActive || !layout.isPro || isPro ? 'text-[rgb(var(--color-text-secondary))]' : 'text-[rgb(var(--color-text-tertiary))]'}`}>
                    {layout.description}
                  </p>
                </div>
              </div>
              {layout.isPro && !isPro && (
                <div className="absolute top-2 right-2">
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
