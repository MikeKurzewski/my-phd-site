import React from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../lib/useSubscription';

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

export default function PlanLimitModal({ isOpen, onClose, feature }: PlanLimitModalProps) {
  const navigate = useNavigate();
  const { handleUpgrade } = useSubscription();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block transform overflow-hidden rounded-lg bg-[rgb(var(--color-bg-secondary))] px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-primary-900))] sm:mx-0 sm:h-10 sm:w-10">
              <Lock className="h-6 w-6 text-[rgb(var(--color-primary-400))]" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-[rgb(var(--color-text-primary))]">
                Pro Feature
              </h3>
              <div className="mt-2">
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {feature} is only available on the Pro plan. Upgrade now to unlock all features!
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="btn-primary w-full sm:ml-3 sm:w-auto"
              onClick={() => {
                onClose();
                handleUpgrade();
              }}
            >
              Upgrade to Pro
            </button>
            <button
              type="button"
              className="btn-secondary mt-3 w-full sm:mt-0 sm:w-auto"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}