import React, { useState, useMemo, useEffect } from 'react';
import { formatPrice, getCurrencySymbol } from '../../utils/currency';
import { ScaleIcon, ChevronDownIcon, ChevronUpIcon, KeyIcon, BuildingOfficeIcon } from '../../constants';

interface RentVsBuyCalculatorProps {
  propertyPrice: number;
  country: string;
}

const AdvancedInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    unit: string;
}> = ({ label, value, onChange, placeholder, unit }) => {
    const id = `rvb-${label.toLowerCase().replace(/\s/g, '-')}`;
    return (
        <div className="flex justify-between items-center text-sm">
            <label htmlFor={id} className="text-neutral-600 font-medium">{label}</label>
            <div className="relative w-32">
                <input 
                    type="number"
                    id={id}
                    step="0.1"
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)} 
                    className="w-full text-sm font-semibold bg-neutral-100 border-neutral-200 border rounded-md p-2 text-right pr-8 focus:ring-1 focus:ring-primary focus:border-primary text-neutral-900"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 font-medium pointer-events-none">{unit}</span>
            </div>
        </div>
    );
};


const RentVsBuyCalculator: React.FC<RentVsBuyCalculatorProps> = ({ propertyPrice, country }) => {
    // --- Basic Inputs ---
    const suggestedRent = useMemo(() => Math.round(propertyPrice / 300), [propertyPrice]);
    const [estimatedRent, setEstimatedRent] = useState('');
    const [planningToStay, setPlanningToStay] = useState(8);
    
    // --- Advanced Inputs (as strings to allow empty placeholders) ---
    const [downPaymentPercent, setDownPaymentPercent] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [loanTerm, setLoanTerm] = useState('30');
    const [propertyTaxes, setPropertyTaxes] = useState('');
    const [homeInsurance, setHomeInsurance] = useState('');
    const [maintenance, setMaintenance] = useState('');
    const [homeAppreciation, setHomeAppreciation] = useState('');
    const [rentIncrease, setRentIncrease] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // --- Results ---
    const [results, setResults] = useState<{ totalRentCost: number; netBuyCost: number } | null>(null);
    
     useEffect(() => {
        const calculateCosts = () => {
            // Parse all string inputs into numbers, providing defaults
            const rentValue = Number(estimatedRent) || suggestedRent;
            const years = planningToStay;
            const termYears = Number(loanTerm) || 30;

            const dpPercent = Number(downPaymentPercent) || 20;
            const ratePercent = Number(interestRate) || 3.5;
            const taxPercent = Number(propertyTaxes) || 1.2;
            const insurancePercent = Number(homeInsurance) || 0.4;
            const maintenancePercent = Number(maintenance) || 1.0;
            const appreciationPercent = Number(homeAppreciation) || 3.0;
            const rentIncreasePercent = Number(rentIncrease) || 2.5;

            // --- RENT CALCULATION ---
            let totalRentCost = 0;
            let currentAnnualRent = rentValue * 12;
            for (let i = 0; i < years; i++) {
                totalRentCost += currentAnnualRent;
                currentAnnualRent *= (1 + rentIncreasePercent / 100);
            }

            // --- BUY CALCULATION ---
            const downPaymentAmount = propertyPrice * (dpPercent / 100);
            const loanPrincipal = propertyPrice - downPaymentAmount;

            if (loanPrincipal <= 0) {
                 setResults({ totalRentCost, netBuyCost: 0 });
                 return;
            }

            const monthlyRate = (ratePercent / 100) / 12;
            const numberOfPayments = termYears * 12;
            const paymentsMade = Math.min(years * 12, numberOfPayments);

            const monthlyPayment = monthlyRate > 0 ?
                loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
                : loanPrincipal / numberOfPayments;
            
            const totalMortgagePaid = monthlyPayment * paymentsMade;

            const remainingPrincipal = monthlyRate > 0 ? (
                paymentsMade >= numberOfPayments ? 0 :
                loanPrincipal * (Math.pow(1 + monthlyRate, numberOfPayments) - Math.pow(1 + monthlyRate, paymentsMade)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
            ) : Math.max(0, loanPrincipal - (monthlyPayment * paymentsMade));

            const principalPaid = loanPrincipal - remainingPrincipal;
            const interestPaid = totalMortgagePaid - principalPaid;

            let totalTaxesPaid = 0;
            let totalInsurancePaid = 0;
            let totalMaintenancePaid = 0;
            let currentPropertyValue = propertyPrice;

            for (let i = 0; i < years; i++) {
                totalTaxesPaid += currentPropertyValue * (taxPercent / 100);
                totalInsurancePaid += propertyPrice * (insurancePercent / 100); // Usually based on original price
                totalMaintenancePaid += propertyPrice * (maintenancePercent / 100); // Usually based on original price
                currentPropertyValue *= (1 + appreciationPercent / 100);
            }

            const appreciatedValue = currentPropertyValue;
            
            const totalNonRecoverable = interestPaid + totalTaxesPaid + totalInsurancePaid + totalMaintenancePaid;
            const appreciationGain = appreciatedValue - propertyPrice;
            
            const netBuyCost = totalNonRecoverable - appreciationGain;

            setResults({
                totalRentCost: isNaN(totalRentCost) ? 0 : totalRentCost,
                netBuyCost: isNaN(netBuyCost) ? 0 : netBuyCost,
            });
        };

        calculateCosts();
    }, [
        propertyPrice, estimatedRent, planningToStay, loanTerm, downPaymentPercent, 
        interestRate, propertyTaxes, homeInsurance, maintenance, homeAppreciation, 
        rentIncrease, suggestedRent
    ]);

    const verdict = useMemo(() => {
        if (!results) return null;
        const { totalRentCost, netBuyCost } = results;

        if (netBuyCost < totalRentCost) {
            return {
                decision: 'Buy',
                savings: totalRentCost - netBuyCost,
                color: 'text-green-600',
            };
        } else {
            return {
                decision: 'Rent',
                savings: netBuyCost - totalRentCost,
                color: 'text-red-600',
            };
        }
    }, [results]);

    const currencySymbol = getCurrencySymbol(country);
    const isBuyCheaper = verdict?.decision === 'Buy';

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
                <ScaleIcon className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-bold text-neutral-800">Rent vs. Buy Calculator</h3>
            </div>
            
            <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-baseline mb-1">
                        <label htmlFor="planning-to-stay" className="text-sm font-semibold text-neutral-700">Planning to stay</label>
                        <span className="text-lg font-bold text-neutral-900">{planningToStay} years</span>
                    </div>
                    <input 
                        id="planning-to-stay"
                        type="range" 
                        min={1} 
                        max={30}
                        value={planningToStay} 
                        onChange={e => setPlanningToStay(e.target.valueAsNumber)}
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
                
                 <div className="relative">
                    <input 
                        type="number" 
                        id="estimated-rent"
                        value={estimatedRent}
                        onChange={e => setEstimatedRent(e.target.value)}
                        placeholder={`${currencySymbol} ${suggestedRent.toLocaleString('de-DE')}`}
                        className="w-full text-base font-semibold bg-neutral-100 border-neutral-200 border rounded-md p-2.5 text-neutral-900"
                    />
                    <label htmlFor="estimated-rent" className="block text-sm font-semibold text-neutral-700 mb-1 absolute -top-2.5 left-3 bg-white px-1 text-xs">Estimated monthly rent</label>
                </div>

                <div>
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex justify-between items-center w-full text-sm font-semibold text-neutral-700">
                        <span>Advanced Settings</span>
                        {showAdvanced ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                    </button>
                    {showAdvanced && (
                        <div className="mt-4 space-y-4 pt-4 border-t animate-fade-in">
                            <AdvancedInput label="Down Payment" value={downPaymentPercent} onChange={setDownPaymentPercent} placeholder="e.g., 20" unit="%" />
                            <AdvancedInput label="Interest Rate" value={interestRate} onChange={setInterestRate} placeholder="e.g., 3.5" unit="%" />
                            <AdvancedInput label="Loan Term" value={loanTerm} onChange={setLoanTerm} placeholder="e.g., 30" unit="yrs" />
                            <AdvancedInput label="Property Taxes" value={propertyTaxes} onChange={setPropertyTaxes} placeholder="e.g., 1.2" unit="%/yr" />
                            <AdvancedInput label="Home Insurance" value={homeInsurance} onChange={setHomeInsurance} placeholder="e.g., 0.4" unit="%/yr" />
                            <AdvancedInput label="Maintenance" value={maintenance} onChange={setMaintenance} placeholder="e.g., 1.0" unit="%/yr" />
                            <AdvancedInput label="Home Appreciation" value={homeAppreciation} onChange={setHomeAppreciation} placeholder="e.g., 3.0" unit="%/yr" />
                            <AdvancedInput label="Rent Increase" value={rentIncrease} onChange={setRentIncrease} placeholder="e.g., 2.5" unit="%/yr" />
                        </div>
                    )}
                </div>

                {verdict && results && (
                    <div className="border-t border-neutral-200 pt-4 text-center">
                        <p className="text-sm font-semibold text-neutral-600">After {planningToStay} years, it's cheaper to</p>
                        <p className={`text-4xl font-extrabold my-1 ${verdict.color}`}>
                            {verdict.decision}
                        </p>
                        <p className="text-base font-semibold text-neutral-700">
                            Estimated savings: {formatPrice(verdict.savings, country)}
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className={`p-3 rounded-lg border ${!isBuyCheaper ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className={`flex items-center gap-2 font-bold ${!isBuyCheaper ? 'text-green-700' : 'text-red-700'}`}>
                                    <BuildingOfficeIcon className="w-5 h-5"/>
                                    <p>Rent</p>
                                </div>
                                <p className="text-xs text-neutral-500 mt-1">Total Cost to Rent</p>
                                <p className={`text-lg font-bold mt-0.5 ${!isBuyCheaper ? 'text-green-700' : 'text-red-700'}`}>{formatPrice(results.totalRentCost, country)}</p>
                            </div>
                             <div className={`p-3 rounded-lg border ${isBuyCheaper ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className={`flex items-center gap-2 font-bold ${isBuyCheaper ? 'text-green-700' : 'text-red-700'}`}>
                                    <KeyIcon className="w-5 h-5"/>
                                    <p>Own</p>
                                </div>
                                <p className="text-xs text-neutral-500 mt-1">Net Cost to Own</p>
                                <p className={`text-lg font-bold mt-0.5 ${isBuyCheaper ? 'text-green-700' : 'text-red-700'}`}>{formatPrice(results.netBuyCost, country)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <p className="text-center text-xs text-neutral-400 mt-6">
                This is an estimate for informational purposes. Many factors can influence the costs of buying and renting.
            </p>
        </div>
    );
};

export default RentVsBuyCalculator;