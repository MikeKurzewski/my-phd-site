import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MediaLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleOpen = (e: CustomEvent) => {
      setMedia(e.detail.media);
      setCurrentIndex(e.detail.startIndex);
      setIsOpen(true);
    };

    window.addEventListener('openLightbox', handleOpen as EventListener);
    return () => window.removeEventListener('openLightbox', handleOpen as EventListener);
  }, []);

  if (!isOpen) return null;

  const currentMedia = media[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
      <button
        onClick={() => setIsOpen(false)}
        className="fixed top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="relative max-w-[90vw] max-h-[90vh]">
        {currentMedia.endsWith('.pdf') ? (
          <iframe
            src={currentMedia}
            className="w-full h-[80vh] rounded-lg"
            title={`PDF Preview ${currentIndex + 1}`}
          />
        ) : (
          <img
            src={currentMedia}
            alt={`Media ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Error';
            }}
          />
        )}

        {media.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % media.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
              {currentIndex + 1} / {media.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
