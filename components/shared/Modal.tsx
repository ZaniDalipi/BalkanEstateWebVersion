import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'lg' | '2xl' | '5xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  if (!isOpen) return null;

  let sizeClass = 'max-w-lg';
  if (size === '2xl') sizeClass = 'max-w-2xl';
  if (size === '5xl') sizeClass = 'max-w-5xl';


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className={`bg-white rounded-lg shadow-xl p-6 md:p-8 w-11/12 ${sizeClass} relative`} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        {title && <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;