import React from 'react';
import Modal from '../shared/Modal';
import PromotionSelector from './PromotionSelector';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle?: string;
  onSuccess?: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  onSuccess,
}) => {
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={propertyTitle ? `Promote: ${propertyTitle}` : 'Promote Your Listing'}
      maxWidth="max-w-6xl"
    >
      <div className="p-6">
        <PromotionSelector
          propertyId={propertyId}
          onSuccess={handleSuccess}
          onSkip={handleSkip}
        />
      </div>
    </Modal>
  );
};

export default PromotionModal;
