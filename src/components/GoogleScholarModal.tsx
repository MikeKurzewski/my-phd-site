import React, { useState } from 'react';

interface GoogleScholarModalProps {
  onClose: () => void;
  onAutoPopulate: (profileUrl: string) => void;
}

export default function GoogleScholarModal({ onClose, onAutoPopulate }: GoogleScholarModalProps) {
  const [profileUrl, setProfileUrl] = useState('');

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content p-6">
          <h3 className="text-lg font-semibold mb-4">Google Scholar Profile</h3>
          <p className="mb-4">Please enter your Google Scholar profile URL:</p>
          <input 
            type="url" 
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            placeholder="https://scholar.google.com/citations?user=..."
            className="form-input mb-4"
          />
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={() => onAutoPopulate(profileUrl)} className="btn-primary">
              Auto Populate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
