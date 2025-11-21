import React from 'react';

const FooterCityscape: React.FC = () => {
    return (
        <div className="relative w-full h-32 overflow-hidden bg-gradient-to-b from-transparent to-primary-dark/30">
            {/* Sky background with subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 to-primary/40"></div>

            {/* Stars in the background */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={`star-${i}`}
                        className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 50}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            opacity: Math.random() * 0.7 + 0.3
                        }}
                    ></div>
                ))}
            </div>

            {/* Buildings Container */}
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-full">
                {/* Building 1 - Tall Apartment */}
                <div className="relative" style={{ height: '70%', width: '60px' }}>
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-b from-orange-400 to-orange-600 rounded-t-lg shadow-2xl">
                        {/* Windows */}
                        {[...Array(5)].map((_, floor) => (
                            <div key={`b1-floor-${floor}`} className="flex justify-around px-2 py-1.5">
                                {[...Array(2)].map((_, window) => (
                                    <div
                                        key={`b1-window-${floor}-${window}`}
                                        className="w-3 h-3 bg-yellow-200 animate-window-light"
                                        style={{
                                            animationDelay: `${Math.random() * 5}s`,
                                            opacity: Math.random() > 0.3 ? 1 : 0.3
                                        }}
                                    ></div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-red-500 rounded-t"></div>
                </div>

                {/* Building 2 - Medium House */}
                <div className="relative" style={{ height: '50%', width: '55px' }}>
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-t-lg shadow-2xl">
                        {/* Roof */}
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[35px] border-r-[35px] border-b-[25px] border-l-transparent border-r-transparent border-b-red-600"></div>
                        {/* Windows */}
                        {[...Array(3)].map((_, floor) => (
                            <div key={`b2-floor-${floor}`} className="flex justify-around px-2 py-1.5">
                                {[...Array(2)].map((_, window) => (
                                    <div
                                        key={`b2-window-${floor}-${window}`}
                                        className="w-3 h-3 bg-yellow-200 animate-window-light"
                                        style={{
                                            animationDelay: `${Math.random() * 5}s`,
                                            opacity: Math.random() > 0.3 ? 1 : 0.3
                                        }}
                                    ></div>
                                ))}
                            </div>
                        ))}
                        {/* Door */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-amber-800 rounded-t-sm"></div>
                    </div>
                </div>

                {/* Building 3 - Tall Modern Apartment */}
                <div className="relative" style={{ height: '80%', width: '70px' }}>
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-b from-teal-400 to-teal-700 rounded-t-lg shadow-2xl">
                        {/* Windows grid */}
                        {[...Array(6)].map((_, floor) => (
                            <div key={`b3-floor-${floor}`} className="flex justify-around px-2 py-1">
                                {[...Array(3)].map((_, window) => (
                                    <div
                                        key={`b3-window-${floor}-${window}`}
                                        className="w-2.5 h-3 bg-yellow-200 animate-window-light"
                                        style={{
                                            animationDelay: `${Math.random() * 5}s`,
                                            opacity: Math.random() > 0.3 ? 1 : 0.3
                                        }}
                                    ></div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="absolute -top-1 left-0 right-0 h-1 bg-gray-700"></div>
                </div>

                {/* Building 4 - Small House */}
                <div className="relative" style={{ height: '45%', width: '50px' }}>
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-b from-purple-400 to-purple-600 rounded-t-lg shadow-2xl">
                        {/* Roof */}
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[30px] border-r-[30px] border-b-[22px] border-l-transparent border-r-transparent border-b-orange-700"></div>
                        {/* Windows */}
                        <div className="flex justify-around px-2 py-2">
                            {[...Array(2)].map((_, window) => (
                                <div
                                    key={`b4-window-${window}`}
                                    className="w-3 h-3 bg-yellow-200 animate-window-light"
                                    style={{
                                        animationDelay: `${Math.random() * 5}s`,
                                        opacity: Math.random() > 0.3 ? 1 : 0.3
                                    }}
                                ></div>
                            ))}
                        </div>
                        {/* Door */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-5 bg-amber-900 rounded-t-sm"></div>
                    </div>
                </div>

                {/* Building 5 - Medium Apartment */}
                <div className="relative" style={{ height: '60%', width: '65px' }}>
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-b from-pink-400 to-pink-600 rounded-t-lg shadow-2xl">
                        {/* Windows */}
                        {[...Array(4)].map((_, floor) => (
                            <div key={`b5-floor-${floor}`} className="flex justify-around px-2 py-1.5">
                                {[...Array(2)].map((_, window) => (
                                    <div
                                        key={`b5-window-${floor}-${window}`}
                                        className="w-3 h-3 bg-yellow-200 animate-window-light"
                                        style={{
                                            animationDelay: `${Math.random() * 5}s`,
                                            opacity: Math.random() > 0.3 ? 1 : 0.3
                                        }}
                                    ></div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-gray-700 rounded-t"></div>
                </div>

                {/* Building 6 - Short House */}
                <div className="relative" style={{ height: '40%', width: '48px' }}>
                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-b from-green-400 to-green-600 rounded-t-lg shadow-2xl">
                        {/* Roof */}
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[28px] border-r-[28px] border-b-[20px] border-l-transparent border-r-transparent border-b-slate-700"></div>
                        {/* Window */}
                        <div className="flex justify-center pt-2">
                            <div className="w-3 h-3 bg-yellow-200 animate-window-light" style={{ opacity: 0.9 }}></div>
                        </div>
                        {/* Door */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-4 bg-amber-900 rounded-t-sm"></div>
                    </div>
                </div>
            </div>

            {/* Walking People */}
            <svg className="absolute bottom-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                {/* Person 1 - Walking right */}
                <g className="animate-walk-right">
                    <circle cx="0" cy="90" r="3" fill="#FFF" />
                    <line x1="0" y1="93" x2="0" y2="103" stroke="#FFF" strokeWidth="2" />
                    <line x1="0" y1="103" x2="-3" y2="110" stroke="#FFF" strokeWidth="2" className="animate-walk-leg" />
                    <line x1="0" y1="103" x2="3" y2="110" stroke="#FFF" strokeWidth="2" className="animate-walk-leg-alt" />
                    <line x1="0" y1="95" x2="-3" y2="100" stroke="#FFF" strokeWidth="2" className="animate-walk-arm" />
                    <line x1="0" y1="95" x2="3" y2="100" stroke="#FFF" strokeWidth="2" className="animate-walk-arm-alt" />
                </g>

                {/* Person 2 - Walking left */}
                <g className="animate-walk-left">
                    <circle cx="100%" cy="92" r="3" fill="#FFD700" />
                    <line x1="100%" y1="95" x2="100%" y2="105" stroke="#FFD700" strokeWidth="2" />
                    <line x1="100%" y1="105" x2="calc(100% - 3px)" y2="112" stroke="#FFD700" strokeWidth="2" className="animate-walk-leg" />
                    <line x1="100%" y1="105" x2="calc(100% + 3px)" y2="112" stroke="#FFD700" strokeWidth="2" className="animate-walk-leg-alt" />
                    <line x1="100%" y1="97" x2="calc(100% - 3px)" y2="102" stroke="#FFD700" strokeWidth="2" className="animate-walk-arm" />
                    <line x1="100%" y1="97" x2="calc(100% + 3px)" y2="102" stroke="#FFD700" strokeWidth="2" className="animate-walk-arm-alt" />
                </g>

                {/* Person 3 - Walking right (slower) */}
                <g className="animate-walk-right-slow">
                    <circle cx="0" cy="91" r="3" fill="#FF6B6B" />
                    <line x1="0" y1="94" x2="0" y2="104" stroke="#FF6B6B" strokeWidth="2" />
                    <line x1="0" y1="104" x2="-3" y2="111" stroke="#FF6B6B" strokeWidth="2" className="animate-walk-leg" />
                    <line x1="0" y1="104" x2="3" y2="111" stroke="#FF6B6B" strokeWidth="2" className="animate-walk-leg-alt" />
                    <line x1="0" y1="96" x2="-3" y2="101" stroke="#FF6B6B" strokeWidth="2" className="animate-walk-arm" />
                    <line x1="0" y1="96" x2="3" y2="101" stroke="#FF6B6B" strokeWidth="2" className="animate-walk-arm-alt" />
                </g>
            </svg>

            {/* Ground/Street */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600">
                {/* Street lines */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-yellow-300 opacity-50"></div>
            </div>

            {/* Inline Styles for Animations */}
            <style jsx>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }

                @keyframes windowLight {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }

                @keyframes walkRight {
                    0% { transform: translateX(-50px); }
                    100% { transform: translateX(calc(100vw + 50px)); }
                }

                @keyframes walkLeft {
                    0% { transform: translateX(50px); }
                    100% { transform: translateX(calc(-100vw - 50px)); }
                }

                @keyframes walkRightSlow {
                    0% { transform: translateX(-50px); }
                    100% { transform: translateX(calc(100vw + 50px)); }
                }

                @keyframes walkLeg {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(20deg); }
                }

                @keyframes walkLegAlt {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(-20deg); }
                }

                @keyframes walkArm {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(-15deg); }
                }

                @keyframes walkArmAlt {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(15deg); }
                }

                .animate-twinkle {
                    animation: twinkle 3s ease-in-out infinite;
                }

                .animate-window-light {
                    animation: windowLight 4s ease-in-out infinite;
                }

                .animate-walk-right {
                    animation: walkRight 20s linear infinite;
                }

                .animate-walk-left {
                    animation: walkLeft 25s linear infinite;
                }

                .animate-walk-right-slow {
                    animation: walkRightSlow 35s linear infinite;
                }

                .animate-walk-leg {
                    animation: walkLeg 0.5s ease-in-out infinite;
                    transform-origin: top;
                }

                .animate-walk-leg-alt {
                    animation: walkLegAlt 0.5s ease-in-out infinite;
                    transform-origin: top;
                }

                .animate-walk-arm {
                    animation: walkArm 0.5s ease-in-out infinite;
                    transform-origin: top;
                }

                .animate-walk-arm-alt {
                    animation: walkArmAlt 0.5s ease-in-out infinite;
                    transform-origin: top;
                }
            `}</style>
        </div>
    );
};

export default FooterCityscape;
