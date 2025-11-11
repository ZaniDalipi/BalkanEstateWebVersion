import React, { useState, useMemo, useEffect } from 'react';
import { formatPrice } from '../../utils/currency';
import { ScaleIcon, ChevronDownIcon, ChevronUpIcon } from '../../constants';

interface RentVsBuyCalculatorProps {
  propertyPrice: number;
  country: string;
}

const RentVsBuyCalculator: React.FC<RentVsBuyCalculatorProps> = ({ propertyPrice, country }) => {
    // --- Basic Inputs ---
    const [estimatedRent, setEstimatedRent] = useState(Math.round(propertyPrice / 300));
    const [planningToStay, setPlanningToStay] = useState(7);
    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [interestRate, setInterestRate] = useState(4.5);
    const [loanTerm, setLoanTerm] = useState(30);

    // --- Advanced Inputs ---
    const [propertyTaxes, setPropertyTaxes] = useState(0.8);
    const [homeInsurance, setHomeInsurance] = useState(0.4);
    const [maintenance, setMaintenance] = useState(1);
    const [homeAppreciation, setHomeAppreciation] = useState(3);
    const [rentIncrease, setRentIncrease] = useState(2);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // --- Results ---
    const [results, setResults] = useState<{ totalRentCost: number; netBuyCost: number } | null>(null);
    
    useEffect(() => {
        const calculateCosts = () => {
            // --- RENTING CALCULATION ---
            let cumulativeRentCost = 0;
            let currentAnnualRent = estimatedRent * 12;
            for (let year = 0; year < planningToStay; year++) {
                cumulativeRentCost += currentAnnualRent;
                currentAnnualRent *= (1 + rentIncrease / 100);
            }

            // --- BUYING CALCULATION ---
            const downPaymentAmount = propertyPrice * (downPaymentPercent / 100);
            const loanAmount = propertyPrice - downPaymentAmount;

            if (loanAmount <= 0) { // Bought in cash
                const totalBuyOutlay = propertyPrice + ((propertyPrice * (propertyTaxes + homeInsurance + maintenance) / 100) * planningToStay);
                const finalHomeValue = propertyPrice * Math.pow(1 + homeAppreciation / 100, planningToStay);
                const netBuyCost = totalBuyOutlay - finalHomeValue;
                setResults({ totalRentCost: cumulativeRentCost, netBuyCost });
                return;
            }

            const monthlyInterestRate = (interestRate / 100) / 12;
            const numberOfPayments = loanTerm * 12;
            const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
            
            const totalMortgagePayments = monthlyPayment * 12 * planningToStay;
            
            // Calculate remaining loan balance after X years
            let remainingBalance = loanAmount;
            if (interestRate > 0) {
              for (let i = 0; i < planningToStay * 12; i++) {
                  const interestForMonth = remainingBalance * monthlyInterestRate;
                  const principalForMonth = monthlyPayment - interestForMonth;
                  remainingBalance -= principalForMonth;
              }
            } else {
              remainingBalance -= monthlyPayment * 12 * planningToStay;
            }

            const finalHomeValue = propertyPrice * Math.pow(1 + homeAppreciation / 100, planningToStay);
            const totalOtherCosts = (propertyPrice * (propertyTaxes + homeInsurance + maintenance) / 100) * planningToStay;
            
            const totalOutlay = downPaymentAmount + totalMortgagePayments + totalOtherCosts;
            const equity = finalHomeValue - remainingBalance;

            // Net cost is your total cash outlay minus the asset (equity) you've built
            const netBuyCost = totalOutlay - equity;
            
            setResults({ totalRentCost: cumulativeRentCost, netBuyCost });
        };
        
        calculateCosts();

    }, [propertyPrice, estimatedRent, planningToStay, downPaymentPercent, interestRate, loanTerm, propertyTaxes, homeInsurance, maintenance, homeAppreciation, rentIncrease]);

    const verdict = useMemo(() => {
        if (!results) return null;
        const { totalRentCost, netBuyCost } = results;
        const difference = Math.abs(totalRentCost - netBuyCost);
        const isBuyBetter = netBuyCost < totalRentCost;
        
        return {
            isBuyBetter,
            message: `After ${planningToStay} years, it's cheaper to`,
            choice: isBuyBetter ? 'Buy' : 'Rent',
            savings: `Your estimated savings by ${isBuyBetter ? 'buying' : 'renting'} would be ${formatPrice(difference, country)}.`,
        };
    }, [results, planningToStay, country]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200">
            <div className="flex items-center gap-3 mb-4">
                <ScaleIcon className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-bold text-neutral-800">Rent vs. Buy Calculator</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="planningToStay" className="flex justify-between items-center text-sm font-semibold text-neutral-700 mb-1">
                        <span>Planning to stay for</span>
                        <span className="font-bold text-primary">{planningToStay} years</span>
                    </label>
                    <input type="range" id="planningToStay" min="1" max="30" value={planningToStay} onChange={e => setPlanningToStay(e.target.valueAsNumber)} className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
                 <div>
                    <label htmlFor="estimatedRent" className="block text-sm font-semibold text-neutral-700 mb-1">Estimated Monthly Rent</label>
                    <input type="number" id="estimatedRent" value={estimatedRent} onChange={e => setEstimatedRent(e.target.valueAsNumber || 0)} className="w-full text-base font-semibold bg-neutral-50 border border-neutral-200 rounded-md p-2" />
                </div>

                <div className="border-t border-neutral-200 pt-4">
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex justify-between items-center text-sm font-semibold text-neutral-700">
                        <span>Advanced Settings</span>
                        {showAdvanced ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                    </button>
                    {showAdvanced && (
                        <div className="mt-4 space-y-3 animate-fade-in">
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs text-neutral-500">Down Payment (%)</label><input type="number" step="1" value={downPaymentPercent} onChange={e => setDownPaymentPercent(e.target.valueAsNumber || 0)} className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded p-1" /></div>
                                <div><label className="text-xs text-neutral-500">Interest Rate (%)</label><input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.valueAsNumber || 0)} className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded p-1" /></div>
                                <div><label className="text-xs text-neutral-500">Property Taxes (%/yr)</label><input type="number" step="0.1" value={propertyTaxes} onChange={e => setPropertyTaxes(e.target.valueAsNumber || 0)} className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded p-1" /></div>
                                <div><label className="text-xs text-neutral-500">Home Insurance (%/yr)</label><input type="number" step="0.1" value={homeInsurance} onChange={e => setHomeInsurance(e.target.valueAsNumber || 0)} className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded p-1" /></div>
                                <div><label className="text-xs text-neutral-500">Maintenance (%/yr)</label><input type="number" step="0.1" value={maintenance} onChange={e => setMaintenance(e.target.valueAsNumber || 0)} className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded p-1" /></div>
                                <div><label className="text-xs text-neutral-500">Appreciation (%/yr)</label><input type="number" step="0.1" value={homeAppreciation} onChange={e => setHomeAppreciation(e.target.valueAsNumber || 0)} className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded p-1" /></div>
                                <div><label className="text-xs text-neutral-500">Rent Increase (%/yr)</label><input type="number" step="0.1" value={rentIncrease} onChange={e => setRentIncrease(e.target.valueAsNumber || 0)} className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded p-1" /></div>
                            </div>
                        </div>
                    )}
                </div>

                {results && verdict && (
                    <div className="border-t border-neutral-200 pt-4 text-center">
                        <p className="text-sm font-semibold text-neutral-600">{verdict.message}</p>
                        <p className={`text-3xl font-extrabold mt-1 ${verdict.isBuyBetter ? 'text-green-600' : 'text-orange-600'}`}>{verdict.choice}</p>
                        <p className="text-xs text-neutral-500 mt-2">{verdict.savings}</p>

                         <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-orange-50 p-2 rounded">
                                <p className="font-bold text-orange-700">Total Rent Cost</p>
                                <p className="font-semibold text-orange-600">{formatPrice(results.totalRentCost, country)}</p>
                            </div>
                            <div className="bg-green-50 p-2 rounded">
                                <p className="font-bold text-green-700">Net Cost to Own</p>
                                <p className="font-semibold text-green-600">{formatPrice(results.netBuyCost, country)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
             <p className="text-center text-xs text-neutral-400 mt-6">
                This is an estimate for informational purposes. Many factors can influence the costs of buying vs. renting.
            </p>
        </div>
    );
};

export default RentVsBuyCalculator;