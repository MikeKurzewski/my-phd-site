import React from 'react';

interface WelcomeModalProps {
  onStartSetup: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStartSetup }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content p-6">
          <h2 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">
            Welcome to Your PhD Website Builder
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            We can use your Google Scholar profile to auto-populate your profile.
            Click the button below to start the auto-setup process.
          </p>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={onStartSetup}>
              Start Auto Setup Process
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                sessionStorage.setItem('newUser', 'false');
                window.location.reload();
              }}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
