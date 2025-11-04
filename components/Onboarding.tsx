import React from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import { LogoIcon } from '../constants';

const Onboarding: React.FC = () => {
  const { dispatch } = useAppContext();

  const handleBuyChoice = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
  };
  
  const handleSellChoice = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'create-listing' });
    dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'signup' } });
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center p-4 overflow-y-auto">
       <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
            <LogoIcon className="w-12 h-12 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-800">
            Balkan <span className="text-primary">Estate</span>
            </h1>
        </div>
        <p className="text-lg sm:text-xl text-neutral-600 mt-2 max-w-xl">Your gateway to properties in the Balkans. Find your dream home or sell with confidence.</p>
       </div>
      
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-4xl border border-neutral-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-neutral-800 mb-8">How can we help you today?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div 
            className="group p-6 border border-neutral-200 rounded-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col"
            onClick={handleBuyChoice}
          >
              <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto-format&fit=crop" alt="A couple looking at a new home" className="rounded-lg mb-6 w-full h-48 object-cover" />
              <div className="text-center flex-grow flex flex-col">
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-2">I'm looking to buy</h3>
                  <p className="text-neutral-600 mb-6 flex-grow">Find your dream home with our powerful search tools and real-time alerts.</p>
                  <button className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg group-hover:bg-primary-dark transition-colors shadow-md group-hover:shadow-lg">
                    Start Searching
                  </button>
              </div>
          </div>

          <div 
            className="group p-6 border border-neutral-200 rounded-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col"
            onClick={handleSellChoice}
          >
              <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto-format&fit=crop" alt="A modern house exterior" className="rounded-lg mb-6 w-full h-48 object-cover" />
              <div className="text-center flex-grow flex flex-col">
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-2">I want to sell</h3>
                  <p className="text-neutral-600 mb-6 flex-grow">List your property, reach thousands of potential buyers, and use our smart tools.</p>
                  <button className="w-full bg-neutral-800 text-white py-3 rounded-lg font-bold text-lg group-hover:bg-neutral-900 transition-colors shadow-md group-hover:shadow-lg">
                    List my Property
                  </button>
              </div>
          </div>
        </div>
      </div>
       <p className="text-center text-neutral-500 mt-8">&copy; 2024 Balkan Estate. All rights reserved.</p>
    </div>
  );
};

export default Onboarding;