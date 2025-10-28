import React from 'react';
import Modal from '../shared/Modal';

interface PricingPlansProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlanCard: React.FC<{title: string, price: string, features: string[], isFeatured?: boolean}> = ({title, price, features, isFeatured}) => {
    return (
        <div className={`p-6 rounded-lg border flex flex-col ${isFeatured ? 'bg-primary-light border-primary' : 'bg-neutral-50 border-neutral-200'}`}>
            {isFeatured && <span className="inline-block bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 self-start">Most Popular</span>}
            <h3 className="text-xl font-bold text-neutral-800">{title}</h3>
            <p className="text-3xl font-extrabold text-neutral-900 my-4">{price}<span className="text-base font-medium text-neutral-500">/listing</span></p>
            <ul className="space-y-2 text-neutral-600 mb-6 flex-grow">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        {feature}
                    </li>
                ))}
            </ul>
            <button className={`w-full py-3 rounded-lg font-bold transition-colors ${isFeatured ? 'bg-primary text-white hover:bg-primary-dark shadow-md' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'}`}>
                Choose Plan
            </button>
        </div>
    )
}

const PricingPlans: React.FC<PricingPlansProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seller Listing Plans">
      <p className="text-center text-neutral-600 mb-8">Choose the plan that best fits your needs to reach more potential buyers.</p>
      <div className="grid md:grid-cols-3 gap-6">
          <PlanCard title="Basic" price="€29" features={['30-day listing', '5 photos', 'Standard placement']} />
          <PlanCard title="Pro" price="€49" features={['60-day listing', '20 photos', 'Featured placement', 'Email support']} isFeatured={true} />
          <PlanCard title="Premium" price="€99" features={['90-day listing', 'Unlimited photos', 'Top placement', 'Virtual tour', '24/7 support']} />
      </div>
      <div className="text-center mt-8 text-sm text-neutral-500">
        All payments are securely processed. You can upgrade or cancel anytime.
      </div>
    </Modal>
  );
};

export default PricingPlans;