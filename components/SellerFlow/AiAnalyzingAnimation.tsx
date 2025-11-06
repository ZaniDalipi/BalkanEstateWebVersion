import React, { useState, useEffect } from 'react';
import { BedIcon, BathIcon, LivingRoomIcon, SqftIcon, ParkingIcon, CubeIcon } from '../../constants';

const facts = [
    { icon: <BedIcon className="w-8 h-8 text-primary" />, label: 'Analyzing room types...' },
    { icon: <SqftIcon className="w-8 h-8 text-primary" />, label: 'Estimating dimensions...' },
    { icon: <CubeIcon className="w-8 h-8 text-primary" />, label: 'Identifying materials...' },
    { icon: <LivingRoomIcon className="w-8 h-8 text-primary" />, label: 'Detecting key features...' },
    { icon: <BathIcon className="w-8 h-8 text-primary" />, label: 'Counting bathrooms...' },
    { icon: <ParkingIcon className="w-8 h-8 text-primary" />, label: 'Checking for parking...' },
];

const AiAnalyzingAnimation: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % facts.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-48 h-48 mx-auto">
            <style>
                {`
                .house-outline {
                    stroke-dasharray: 280;
                    stroke-dashoffset: 280;
                    animation: draw-house 1.5s ease-in-out forwards;
                }
                @keyframes draw-house {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
                .analysis-box {
                    animation: zoom-pulse 1.5s ease-in-out infinite;
                }
                @keyframes zoom-pulse {
                    0%, 100% { opacity: 0; transform: scale(0.7); }
                    25%, 75% { opacity: 1; transform: scale(1); }
                }
                `}
            </style>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <path
                    className="house-outline"
                    d="M10 90 V45 L50 10 L90 45 V90 H10 Z"
                    fill="none"
                    stroke="#0252CD" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <div className="w-full h-full flex items-center justify-center">
                <div className="analysis-box">
                    <div className="border border-primary/30 bg-white/80 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center justify-center text-center w-36">
                        {React.cloneElement(facts[currentIndex].icon, { className: "w-8 h-8 text-primary mb-2" })}
                        <p className="text-xs font-semibold text-neutral-600 h-8 flex items-center">
                            {facts[currentIndex].label}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiAnalyzingAnimation;