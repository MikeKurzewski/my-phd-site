import React from 'react';

interface Publication {
  id: number;
  title: string;
  // add any other properties if needed
}

interface ConfirmationModalProps {
  publications: Publication[];
  onRemove: (index: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ publications, onRemove, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="bg-[rgb(var(--color-bg-primary))] modal-content p-6 ">
          <h3 className="text-lg font-semibold mb-4 ">Confirm Publications</h3>
          {publications.length > 0 ? (
            <ul className="space-y-2 max-h-[calc(100vh-24rem)] overflow-y-auto">
              {publications.map((pub, index) => (
                <li key={index} className="bg-[rgb(var(--color-bg-secondary))] flex justify-between items-center p-4 gap-6 rounded-md">
                  <span className="text-sm">{pub.title}</span>
                  <button
                    onClick={() => onRemove(index)}
                    className="btn-secondary text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No publications to confirm.</p>
          )}
          <div className="flex justify-end space-x-3 mt-4">
            <button onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button onClick={onConfirm} className="btn-primary">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
