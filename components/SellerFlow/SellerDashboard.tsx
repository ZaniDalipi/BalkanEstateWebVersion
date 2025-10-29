import React from 'react';
import Header from '../shared/Header';
import { UserRole } from '../../types';
import PropertyCalculator from './PropertyCalculator';
import { useAppContext } from '../../context/AppContext';
import GeminiDescriptionGenerator from './GeminiDescriptionGenerator';
import { CurrencyDollarIcon, SparklesIcon } from '../../constants';

const SellerDashboard: React.FC = () => {
    const { dispatch } = useAppContext();

    const handlePlansClick = () => {
        dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: true, isOffer: false } });
    };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header userRole={UserRole.SELLER} dispatch={dispatch} onPlansClick={handlePlansClick} />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-8">Seller Dashboard</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                 <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-primary-light p-3 rounded-full">
                            <SparklesIcon className="w-6 h-6 text-primary"/>
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-800">AI Property Description</h3>
                    </div>
                    <p className="text-neutral-600 mb-6">
                        Simply upload photos of your property, and our AI will analyze them to automatically generate a detailed and compelling listing description. Save time and attract more buyers.
                    </p>
                    <GeminiDescriptionGenerator />
                </div>
            </div>
            <div className="lg:col-span-1">
                 <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 h-full">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-secondary/20 p-3 rounded-full">
                            <CurrencyDollarIcon className="w-6 h-6 text-secondary"/>
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-800">Value Calculator</h3>
                    </div>
                    <p className="text-neutral-600 mb-6">
                        Get a quick estimate of your property's market value based on location and features.
                    </p>
                    <PropertyCalculator />
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;