import React from 'react';
import Modal from '../shared/Modal';
import { AtSymbolIcon } from '../../constants';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const inputBaseClasses = "block w-full text-base bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 shadow-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors focus:bg-white";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Get Instant Property Alerts">
      <p className="text-neutral-600 mb-4 text-center">
        Never miss a new listing! Subscribe to our premium alert program to get notified the moment a property matching your criteria hits the market.
      </p>
      <div className="bg-primary-light border border-primary/50 rounded-lg p-4 my-6">
        <h3 className="font-bold text-primary-dark text-center">Premium Plan - €9.99/month</h3>
        <ul className="list-disc list-inside text-primary-dark/80 mt-2 space-y-1 mx-auto max-w-xs">
            <li>Instant email and SMS notifications</li>
            <li>Save unlimited searches</li>
            <li>Early access to new listings</li>
            <li>Advanced market insights</li>
        </ul>
      </div>
      <form>
        <div className="mb-4">
            <label htmlFor="email" className="block text-neutral-700 font-semibold mb-2">Email Address</label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <AtSymbolIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <input type="email" id="email" className={`${inputBaseClasses} pl-10`} placeholder="you@example.com" />
            </div>
        </div>
         <div className="mb-6">
            <label htmlFor="card" className="block text-neutral-700 font-semibold mb-2">Card Details</label>
            <div className="p-3 border border-neutral-300 rounded-lg bg-neutral-50">
                <p className="text-sm text-neutral-500 text-center">Mock Payment Gateway</p>
            </div>
        </div>
        <button type="submit" className="w-full bg-secondary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-md hover:shadow-lg">
            Subscribe Now
        </button>
      </form>
    </Modal>
  );
};

export default SubscriptionModal;