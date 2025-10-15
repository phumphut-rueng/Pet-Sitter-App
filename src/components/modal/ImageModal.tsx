import React, { useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
  overlayOpacity?: number; // เพิ่ม prop สำหรับปรับ opacity ของพื้นหลัง
}

const ImageModal: React.FC<ImageModalProps> = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  alt = 'Expanded image',
  overlayOpacity = 0.75 // default opacity 75%
}) => {
  // ปิด modal เมื่อกด ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // ป้องกันการ scroll ของ body เมื่อ modal เปิด
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white rounded-full p-2 transition-all duration-200 hover:scale-110"
        style={{ backgroundColor: `rgba(0, 0, 0, ${Math.min(overlayOpacity + 0.2, 0.8)})` }}
        aria-label="Close image"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Image container */}
      <div 
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt={alt}
          width={800}
          height={600}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          priority
        />
      </div>

      {/* Background overlay - click to close */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Close image"
      />
    </div>
  );
};

export default ImageModal;
