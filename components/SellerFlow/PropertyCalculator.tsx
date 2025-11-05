import React, { useState, useMemo } from 'react';
import { formatPrice } from '../../utils/currency';
import { allProperties as dummyProperties } from '../../services/apiService';
import { CITY_DATA } from '../../services/propertyService';

const PropertyCalculator: React.FC = () => {
  const [result, setResult] = useState<{value: number, country: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableCountries = useMemo(() => Object.keys(CITY_DATA).sort(), []);
  const [selectedCountry, setSelectedCountry] = useState('');

  const availableCities = useMemo(() => {
    if (!selectedCountry || !CITY_DATA[selectedCountry]) return [];
    return CITY_DATA[selectedCountry].map(city => city.name).sort();
  }, [selectedCountry]);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    
    const form = e.currentTarget; // Capture the form element immediately

    // Simulate API call and calculation
    setTimeout(() => {
        const formData = new FormData(form); // Use the captured variable
        const country = formData.get('country') as string;
        const city = formData.get('city') as string;
        const sqft = Math.max(0, Number(formData.get('sqft')));

        if (!city || !country) {
            setError('Please select a country and city.');
            setLoading(false);
            return;
        }

        const propertiesInCity = dummyProperties.filter(p => p.city.toLowerCase() === city.toLowerCase());

        if (propertiesInCity.length < 3) { // Require a minimum number of properties for a reliable estimate
            setError(`Sorry, we don't have enough data for ${city} to provide a reliable estimate.`);
            setLoading(false);
            return;
        }

        const totalSqft = propertiesInCity.reduce((sum, p) => sum + p.sqft, 0);
        const totalPrice = propertiesInCity.reduce((sum, p) => sum + p.price, 0);
        const avgPricePerSqft = totalPrice / totalSqft;

        // Add some variance to make it an "estimate"
        const estimatedValue = avgPricePerSqft * sqft * (Math.random() * 0.2 + 0.9);

        setResult({
            value: Math.round(estimatedValue / 100) * 100, // Round to nearest 100
            country: country
        });
        setLoading(false);
    }, 1000);
  };
  
  const floatingInputClasses = "block px-2.5 pb-2.5 pt-4 w-full text-base text-neutral-900 bg-white rounded-lg border border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer";
  const floatingLabelClasses = "absolute text-base text-neutral-700 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1";
  const floatingSelectLabelClasses = "absolute text-base text-neutral-700 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 start-1";

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
           <div className="relative">
             <input type="text" name="address" id="address" className={floatingInputClasses} placeholder=" " required />
             <label htmlFor="address" className={floatingLabelClasses}>Address / Suburb</label>
          </div>
           <div className="relative">
            <select 
              id="country" 
              name="country" 
              value={selectedCountry} 
              onChange={(e) => setSelectedCountry(e.target.value)} 
              className={floatingInputClasses}
              required
            >
              <option value="" disabled>Select a country</option>
              {availableCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
              ))}
            </select>
             <label htmlFor="country" className={floatingSelectLabelClasses}>Country</label>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <div className="relative">
            <select 
              id="city" 
              name="city" 
              key={selectedCountry} // Force re-render on country change
              defaultValue=""
              className={floatingInputClasses} 
              disabled={!selectedCountry}
              required
            >
              <option value="" disabled>Select a city</option>
              {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
              ))}
            </select>
             <label htmlFor="city" className={floatingSelectLabelClasses}>City</label>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <div className="relative">
             <input type="number" name="sqft" id="sqft" min="0" defaultValue="100" className={floatingInputClasses} placeholder=" " required />
             <label htmlFor="sqft" className={floatingLabelClasses}>Area (m²)</label>
          </div>
           <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-opacity-50">
            {loading ? 'Calculating...' : 'Calculate'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 bg-red-100 p-4 rounded-lg text-center">
            <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {result && !error && (
        <div className="mt-6 bg-secondary/10 p-4 rounded-lg text-center">
            <p className="text-sm font-medium text-secondary/80">Estimated Value</p>
            <p className="text-3xl font-bold text-secondary">{formatPrice(result.value, result.country)}</p>
        </div>
      )}
    </div>
  );
};

export default PropertyCalculator;