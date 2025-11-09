import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BedIcon, BathIcon, LivingRoomIcon, SqftIcon, ParkingIcon, CubeIcon } from '../../constants';

const icons = [
    { id: 1, icon: <BedIcon className="w-8 h-8 text-primary" /> },
    { id: 2, icon: <BathIcon className="w-8 h-8 text-primary" /> },
    { id: 3, icon: <LivingRoomIcon className="w-8 h-8 text-primary" /> },
    { id: 4, icon: <SqftIcon className="w-8 h-8 text-primary" /> },
    { id: 5, icon: <ParkingIcon className="w-8 h-8 text-primary" /> },
    { id: 6, icon: <CubeIcon className="w-8 h-8 text-primary" /> },
];

const GRID_SIZE = 9;
const GAME_DURATION = 20; // seconds

interface WhackAnIconAnimationProps {
    mode?: 'loading' | 'game';
    onGameEnd?: (score: number, totalMoles: number) => void;
}

const WhackAnIconAnimation: React.FC<WhackAnIconAnimationProps> = ({ mode = 'loading', onGameEnd }) => {
    const [activeMole, setActiveMole] = useState<number | null>(null);
    const [whackedMole, setWhackedMole] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [hitFeedback, setHitFeedback] = useState<{ index: number, key: number } | null>(null);
    const [scoreChanged, setScoreChanged] = useState(false);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [totalMoles, setTotalMoles] = useState(0);
    const [isGameActive, setIsGameActive] = useState(mode === 'game');
    
    const scoreRef = useRef(0);
    const totalMolesRef = useRef(0);

    const popUp = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * GRID_SIZE);
        setActiveMole(randomIndex);
        if (isGameActive) {
            setTotalMoles(prev => {
                const newTotal = prev + 1;
                totalMolesRef.current = newTotal;
                return newTotal;
            });
        }

        setTimeout(() => {
            setActiveMole(current => (current === randomIndex ? null : current));
        }, Math.random() * 400 + 600);
    }, [isGameActive]);

    useEffect(() => {
        if (!isGameActive) return;

        const gameTimer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(gameTimer);
                    setIsGameActive(false);
                    if (onGameEnd) {
                        onGameEnd(scoreRef.current, totalMolesRef.current);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(gameTimer);
    }, [isGameActive, onGameEnd]);

    useEffect(() => {
        if (isGameActive) {
            const moleInterval = setInterval(popUp, Math.random() * 500 + 800);
            return () => clearInterval(moleInterval);
        }
    }, [isGameActive, popUp]);
    
    useEffect(() => {
        if (mode === 'loading') {
            const loadingInterval = setInterval(popUp, Math.random() * 800 + 1000);
            return () => clearInterval(loadingInterval);
        }
    }, [mode, popUp]);


    const handleWhack = (index: number) => {
        if (index !== activeMole || whackedMole !== null) return;

        setWhackedMole(index);
        setHitFeedback({ index, key: Date.now() });
        
        setTimeout(() => {
            setActiveMole(null);
            setWhackedMole(null);
        }, 300);

        setScore(s => {
            const newScore = s + 1;
            scoreRef.current = newScore;
            return newScore;
        });
        setScoreChanged(true);
        setTimeout(() => setScoreChanged(false), 300);
    };

    const getRandomIcon = (index: number) => {
        return icons[index % icons.length].icon;
    };
    
    const renderGameContent = () => {
        if (!isGameActive && mode === 'game') {
            const percentage = totalMoles > 0 ? Math.round((score / totalMoles) * 100) : 0;
            return (
                <div className="text-center animate-fade-in">
                    <h3 className="text-2xl font-bold text-primary">Game Over!</h3>
                    <p className="text-lg mt-2">Your Score: <span className="font-bold">{score} / {totalMoles} ({percentage}%)</span></p>
                    <p className="mt-4 text-neutral-600">Calculating your discount...</p>
                </div>
            );
        }
        
        return (
             <div className="relative w-full max-w-[20rem] sm:max-w-xs aspect-square">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full h-full bg-green-200/50 p-2 sm:p-4 rounded-lg border-2 border-green-300/50">
                    {Array.from({ length: GRID_SIZE }).map((_, index) => (
                        <div key={index} className="relative w-full h-full bg-green-800/20 rounded-full flex items-center justify-center overflow-hidden">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/20 rounded-full" />
                            <div
                                onMouseDown={() => handleWhack(index)}
                                className={`absolute bottom-0 w-full flex justify-center transition-all duration-300 ease-out ${
                                    activeMole === index ? 'translate-y-0' : 'translate-y-full'
                                } ${whackedMole === index ? 'scale-50 opacity-0 -rotate-90' : ''}`}
                            >
                                <div className="p-2 bg-white rounded-full shadow-lg border-2 border-primary-light cursor-pointer hover:scale-110">
                                    {getRandomIcon(index)}
                                </div>
                            </div>
                            {hitFeedback && hitFeedback.index === index && (
                                <div key={hitFeedback.key} className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pop-and-fade">
                                    <span className="text-yellow-400 text-3xl font-bold">+1</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {mode === 'game' && (
                     <div className="absolute -top-4 left-0 bg-primary text-white font-bold px-4 py-2 rounded-lg shadow-lg">
                        Time: {timeLeft}s
                    </div>
                )}
                <div className={`absolute -top-4 -right-4 bg-secondary text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-transform duration-200 ${scoreChanged ? 'scale-125' : ''}`}>
                    Score: {score}
                </div>
            </div>
        )
    };

    return (
        <div className="flex flex-col items-center justify-center py-8 w-full">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-800">
                {mode === 'game' ? 'Whack-an-Icon!' : 'Analyzing Property...'}
            </h3>
            <p className="text-neutral-600 mt-2 mb-6 max-w-sm mx-auto text-center">
                {mode === 'game' && onGameEnd ? `You have ${GAME_DURATION} seconds to click as many icons as you can. Your score determines your discount!` : 'Our AI is hard at work. Feel free to play a game while you wait!'}
            </p>
            {renderGameContent()}
        </div>
    );
};

export default WhackAnIconAnimation;