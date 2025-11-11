import React from 'react';
import Modal from './Modal';
import WhackAnIconAnimation from '../SellerFlow/WhackAnIconAnimation';

interface DiscountGameModalProps {
    isOpen: boolean;
    onGameComplete: (discounts: { proYearly: number; proMonthly: number; enterprise: number; }) => void;
}

const DiscountGameModal: React.FC<DiscountGameModalProps> = ({ isOpen, onGameComplete }) => {
    
    const handleGameEnd = (score: number, totalMoles: number) => {
        const ratio = totalMoles > 0 ? score / totalMoles : 0;
        
        // Calculate discounts based on performance
        // Pro Yearly gets up to 50%, others up to 30%
        const discounts = {
            proYearly: Math.round(ratio * 50),
            proMonthly: Math.round(ratio * 30),
            enterprise: Math.round(ratio * 30),
        };
        
        // A small delay to show the final score before transitioning
        setTimeout(() => {
            onGameComplete(discounts);
        }, 2000);
    };

    // This modal cannot be closed by the user to ensure they play the game.
    const handleClose = () => {};

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
            <WhackAnIconAnimation mode="game" onGameEnd={handleGameEnd} />
        </Modal>
    );
};

export default DiscountGameModal;
