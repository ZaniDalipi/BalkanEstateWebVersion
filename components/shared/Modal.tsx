import React, { useEffect, useCallback, memo } from 'react';
import { XMarkIcon } from '../../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'lg' | '2xl' | '5xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  // Lock body scroll when modal is open to prevent map jumping
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!isOpen) return null;

  let sizeClass = 'max-w-lg';
  if (size === '2xl') sizeClass = 'max-w-2xl';
  if (size === '5xl') sizeClass = 'max-w-5xl';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[5000] flex justify-center items-center p-3" onClick={handleBackdropClick}>
      <div
        className={`bg-white rounded-lg shadow-xl p-4 md:p-6 w-full ${sizeClass} relative overflow-y-auto max-h-[90vh]`}
        onClick={handleContentClick}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-800" aria-label="Close modal">
          <XMarkIcon className="w-5 h-5" />
        </button>
        {title && <h2 className="text-xl font-bold text-neutral-800 mb-3 text-center">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default memo(Modal);