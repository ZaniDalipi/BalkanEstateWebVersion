// This file provides utility functions for currency formatting.
// Based on the application's usage, all prices are assumed to be in Euros.

/**
 * Returns the currency symbol. Currently hardcoded to Euro as per app usage.
 * @param _country - The country context (currently ignored).
 * @returns The currency symbol string.
 */
export const getCurrencySymbol = (_country?: string): string => {
    return '€';
};

/**
 * Formats a number into a currency string with a Euro symbol and German-style number formatting.
 * e.g., 1000000 becomes "€1.000.000"
 * @param price - The numerical price to format.
 * @param _country - The country context (currently ignored).
 * @returns A formatted currency string.
 */
export const formatPrice = (price: number, _country?: string): string => {
    if (price === null || price === undefined || isNaN(price)) {
        return 'Price unavailable';
    }
    const symbol = getCurrencySymbol(); // country is ignored for now
    // The 'de-DE' locale uses dots for thousands separators, which matches the app's style.
    const formattedPrice = new Intl.NumberFormat('de-DE').format(price);
    return `${symbol}${formattedPrice}`;
};