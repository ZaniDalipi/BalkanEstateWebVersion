import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '../../constants';

interface ImageViewerModalProps {
    images: { url: string; tag: string }[];
    startIndex: number;
    onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ images, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    const handleNext = () => {
        setCurrentIndex(prev => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [images.length]);

    if (images.length === 0) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-[6000] flex flex-col items-center justify-center p-4" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-20">
                <XMarkIcon className="w-8 h-8" />
            </button>
            
            <div className="relative w-[80vw] h-[80vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                <button onClick={handlePrev} className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/40 transition-colors z-10">
                    <ChevronLeftIcon className="w-8 h-8 text-white"/>
                </button>
                
                <div className="w-full h-full flex items-center justify-center">
                    <img
                        key={images[currentIndex].url}
                        src={images[currentIndex].url}
                        alt={`Property view ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain animate-fade-in"
                    />
                </div>
                
                <button onClick={handleNext} className="absolute right-0 translate-x-full top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/40 transition-colors z-10">
                    <ChevronRightIcon className="w-8 h-8 text-white"/>
                </button>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
};

export default ImageViewerModal;