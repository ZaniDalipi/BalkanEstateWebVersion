import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { AtSymbolIcon, UserIcon, BuildingOfficeIcon, CheckCircleIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { dispatch } = useAppContext();
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');

  const handleViewSellerPlans = () => {
    onClose();
    // A small delay to ensure the first modal has time to start closing animation
    setTimeout(() => {
        dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: true, isOffer: false } });
    }, 150);
  };
  
  const inputBaseClasses = "block w-full text-base bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 shadow-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors focus:bg-white placeholder:text-neutral-700";

  const renderBuyerPlan = () => (
    <div className="animate-fade-in grid md:grid-cols-2 gap-8 items-center">
        <div>
             <h3 className="text-xl sm:text-2xl font-bold text-neutral-800">Buyer Pro</h3>
             <div className="mt-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-primary">€1.50</span>
                <span className="text-base sm:text-lg font-semibold text-neutral-500">/month</span>
             </div>
             <p className="text-neutral-600 mt-2 text-sm sm:text-base">Never miss a new listing! Get notified the moment a property matching your criteria hits the market.</p>
            <ul className="mt-6 space-y-3 text-neutral-700 text-sm sm:text-base">
                <li className="flex items-center gap-3"><CheckCircleIcon className="w-6 h-6 text-green-500" /> Instant email & SMS notifications</li>
                <li className="flex items-center gap-3"><CheckCircleIcon className="w-6 h-6 text-green-500" /> Save unlimited searches</li>
                <li className="flex items-center gap-3"><CheckCircleIcon className="w-6 h-6 text-green-500" /> Early access to new listings</li>
                <li className="flex items-center gap-3"><CheckCircleIcon className="w-6 h-6 text-green-500" /> Advanced market insights</li>
                <li className="flex items-center gap-3"><CheckCircleIcon className="w-6 h-6 text-green-500" /> Advanced neighborhood insights</li>
            </ul>
        </div>
        <div className="bg-neutral-50 p-6 rounded-lg border">
             <form>
                <div className="mb-4">
                    <label htmlFor="email_sub" className="block text-neutral-700 font-semibold mb-2 text-sm">Email Address</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <AtSymbolIcon className="h-5 w-5 text-neutral-400" />
                        </div>
                        <input type="email" id="email_sub" className={`${inputBaseClasses} pl-10`} placeholder="you@example.com" />
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="card_sub" className="block text-neutral-700 font-semibold mb-2 text-sm">Card Details</label>
                    <div className="p-3 border border-neutral-300 rounded-lg bg-white text-center">
                        <p className="text-sm text-neutral-500">Mock Payment Gateway</p>
                    </div>
                </div>
                <button type="submit" className="w-full bg-secondary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-md hover:shadow-lg">
                    Subscribe Now
                </button>
            </form>
        </div>
    </div>
  );

  const renderSellerPlan = () => (
    <div className="animate-fade-in text-center p-4 sm:p-8">
        <BuildingOfficeIcon className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl sm:text-2xl font-bold text-neutral-800">Seller & Agent Plans</h3>
        <p className="text-neutral-600 mt-2 max-w-md mx-auto text-sm sm:text-base">Reach thousands of potential buyers with our powerful tools for sellers.</p>
        <ul className="mt-6 text-left space-y-3 max-w-xs mx-auto text-neutral-700 text-sm sm:text-base">
            <li className="flex items-center gap-3"><CheckCircleIcon className="w-6 h-6 text-green-500" /> Premium listing placement</li>
            <li className="flex items-center gap-3"><CheckCircleIcon className="w-6 h-6 text-green-500" /> Advanced analytics</li>
            <li className="flex items-center gap-3"><CheckCircleIcon className="w-6 h-6 text-green-500" /> List more properties</li>
        </ul>
        <button 
            onClick={handleViewSellerPlans}
            className="mt-8 px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
        >
            View All Seller Plans
        </button>
    </div>
  );


  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" title="Choose Your Plan">
        <div className="bg-neutral-100 p-1 rounded-full flex items-center space-x-1 border border-neutral-200 shadow-sm max-w-md mx-auto mb-6">
            <button
                onClick={() => setActiveTab('buyer')}
                className={`w-1/2 px-4 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'buyer' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}
            >
                <UserIcon className="w-5 h-5"/>
                For Buyers
            </button>
            <button
                onClick={() => setActiveTab('seller')}
                className={`w-1/2 px-4 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'seller' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}
            >
                <BuildingOfficeIcon className="w-5 h-5"/>
                For Sellers
            </button>
        </div>

        {activeTab === 'buyer' ? renderBuyerPlan() : renderSellerPlan()}

        <div className="text-center mt-8">
            <button onClick={onClose} className="text-sm font-semibold text-neutral-500 hover:text-neutral-700 transition-colors">
                Maybe later
            </button>
        </div>
    </Modal>
  );
};

export default SubscriptionModal;