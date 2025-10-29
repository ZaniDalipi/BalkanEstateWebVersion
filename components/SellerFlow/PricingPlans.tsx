import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { BuildingOfficeIcon, ChartBarIcon, CurrencyDollarIcon, BoltIcon } from '../../constants';

interface PricingPlansProps {
  isOpen: boolean;
  onClose: () => void;
  isOffer?: boolean;
}

const TickIcon: React.FC = () => (
    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
);

const PricingPlans: React.FC<PricingPlansProps> = ({ isOpen, onClose, isOffer = false }) => {
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    if (!isOpen || !isOffer) {
        setTimeLeft(30 * 60);
        return;
    };

    const timer = setInterval(() => {
        setTimeLeft(prevTime => {
            if (prevTime <= 1) {
                clearInterval(timer);
                return 0;
            }
            return prevTime - 1;
        });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isOffer]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <div className="p-2 sm:p-4">
            {isOffer && (
                 <div className="bg-red-500 text-white p-4 rounded-xl mb-6 text-center shadow-lg">
                    <div className="flex items-center justify-center gap-3">
                        <BoltIcon className="w-7 h-7" />
                        <h3 className="text-xl font-bold">Limited Time Offer!</h3>
                    </div>
                    <p className="font-mono text-2xl mt-2 tracking-widest">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</p>
                </div>
            )}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-neutral-800 tracking-tight">Choose Your Selling Plan</h2>
                <p className="mt-4 text-lg text-neutral-600">Get your property in front of thousands of potential buyers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-8">
                {/* Pro Yearly Plan */}
                <div className="relative p-6 rounded-2xl border-2 border-green-400 bg-gradient-to-br from-green-50 to-cyan-50 shadow-lg lg:-translate-y-4 flex flex-col h-full">
                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 flex gap-2">
                        <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">MOST POPULAR</span>
                        {isOffer && <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">60% OFF</span>}
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-neutral-800">Pro Yearly</h3>
                        <p className="mt-2">
                            {isOffer && <span className="text-2xl font-semibold text-neutral-500 line-through mr-2">€200</span>}
                            <span className="text-5xl font-extrabold text-neutral-900">{isOffer ? '€80' : '€200'}</span>
                            <span className="text-xl font-semibold text-neutral-600">/year</span>
                        </p>
                        {isOffer && <p className="font-bold text-green-600 mt-2">Save €120 today!</p>}
                    </div>
                     {isOffer && <div className="my-6 text-center bg-green-500 text-white font-bold py-2 rounded-lg shadow-md">+ 15 DAYS FREE TRIAL</div>}
                    <ul className={`${isOffer ? 'mt-0' : 'mt-8'} space-y-4 text-neutral-700 font-medium flex-grow`}>
                        <li className="flex items-center"><TickIcon /> Up to 10 active property ads</li>
                        <li className="flex items-center"><TickIcon /> Premium listing placement</li>
                        <li className="flex items-center"><TickIcon /> Advanced analytics dashboard</li>
                        <li className="flex items-center"><TickIcon /> Lead management system</li>
                        <li className="flex items-center"><TickIcon /> Professional photography tips</li>
                        <li className="flex items-center"><TickIcon /> Priority customer support</li>
                    </ul>
                    <button className="w-full mt-8 py-3.5 rounded-lg font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-md text-lg">
                        Get Pro Annual - {isOffer ? '€80' : '€200'}/year
                    </button>
                </div>

                {/* Pro Monthly Plan */}
                <div className="p-6 rounded-2xl border border-neutral-200 bg-white flex flex-col h-full relative">
                     {isOffer && (
                        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                            <span className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">50% OFF</span>
                        </div>
                     )}
                     <div className="text-center">
                        <h3 className="text-2xl font-bold text-neutral-800">Pro Monthly</h3>
                        <p className="mt-2">
                            {isOffer && <span className="text-2xl font-semibold text-neutral-500 line-through mr-2">€25</span>}
                            <span className="text-5xl font-extrabold text-neutral-900">{isOffer ? '€12.50' : '€25'}</span>
                            <span className="text-xl font-semibold text-neutral-600">/month</span>
                        </p>
                        {isOffer && <p className="font-bold text-green-600 mt-2">Save €12.50 monthly!</p>}
                    </div>
                    <div className="mt-8 space-y-3 flex-grow flex flex-col">
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                            <p className="font-semibold text-neutral-800">Up to 3 active ads</p>
                            <p className="text-neutral-600 text-sm">Great for starting out</p>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                            <p className="font-semibold text-neutral-800">Standard placement</p>
                            <p className="text-neutral-600 text-sm">Visible in search results</p>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                            <p className="font-semibold text-neutral-800">Basic analytics</p>
                            <p className="text-neutral-600 text-sm">Track your listing views</p>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                            <p className="font-semibold text-neutral-800">Email support</p>
                            <p className="text-neutral-600 text-sm">Get help when you need it</p>
                        </div>
                         <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                            <p className="font-semibold text-neutral-800">Mobile app access</p>
                            <p className="text-neutral-600 text-sm">Manage on the go</p>
                        </div>
                    </div>
                     <button className="w-full mt-8 py-3.5 rounded-lg font-bold bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors shadow-sm text-lg">
                        Get Pro Monthly - {isOffer ? '€12.50' : '€25'}/month
                    </button>
                </div>

                {/* Enterprise Plan */}
                <div className="relative p-6 rounded-2xl bg-neutral-800 text-white overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 flex gap-2">
                         <span className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">OFFER</span>
                         {isOffer && <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">20% OFF</span>}
                    </div>
                     <div className="text-center">
                        <div className="flex justify-center items-center gap-2">
                           <BuildingOfficeIcon className="w-8 h-8 text-amber-400" />
                           <h3 className="text-2xl font-bold">Enterprise Plan</h3>
                        </div>
                        <p className="mt-2">
                            {isOffer && <span className="text-xl font-semibold text-neutral-400 line-through mr-2">€1,000</span>}
                            <span className="text-4xl font-extrabold">{isOffer ? '€800' : '€1,000'}</span>
                            <span className="text-lg font-semibold text-neutral-300">/year</span>
                        </p>
                         {isOffer && <p className="font-bold text-green-400 mt-2">Save €200!</p>}
                    </div>
                    <div className="mt-8 space-y-4 flex-grow">
                        <div className="bg-neutral-700/50 p-4 rounded-lg">
                            <p className="font-bold text-lg">Unlimited Property Listings</p>
                            <p className="text-neutral-300 text-sm">Post as many properties as you need</p>
                        </div>
                         <div className="bg-neutral-700/50 p-4 rounded-lg">
                            <p className="font-bold text-lg">3 Priority Ads per month</p>
                            <p className="text-neutral-300 text-sm">Always shown first to users</p>
                        </div>
                         <div className="bg-neutral-700/50 p-4 rounded-lg">
                            <p className="font-bold text-lg">Dedicated Account Manager</p>
                            <p className="text-neutral-300 text-sm">Personal support for your business</p>
                        </div>
                    </div>
                     <button className="w-full mt-8 py-3.5 rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-md text-lg">
                        Perfect for Real Estate Companies
                    </button>
                </div>
            </div>

            <div className="mt-10 pt-6 border-t border-neutral-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-neutral-600 font-medium">
                        <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
                        <span>30-day money-back guarantee</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-neutral-600 font-medium">
                        <ChartBarIcon className="w-6 h-6 text-blue-500" />
                        <span>3x more views than free listings</span>
                    </div>
                     <div className="flex items-center justify-center gap-2 text-neutral-600 font-medium">
                        <BoltIcon className="w-6 h-6 text-yellow-500" />
                        <span>Instant activation</span>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
  );
};

export default PricingPlans;