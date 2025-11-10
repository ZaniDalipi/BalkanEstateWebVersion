import { Property, Filters } from '../types';

export const filterProperties = (properties: Property[], filters: Filters): Property[] => {
    const query = filters.query?.toLowerCase().trim();

    return properties.filter(p => {
        let queryMatch = true;
        if (query) {
            const addressMatch = p.address.toLowerCase().includes(query);
            const cityMatch = p.city.toLowerCase().includes(query);
            const countryMatch = p.country.toLowerCase().includes(query);
            queryMatch = addressMatch || cityMatch || countryMatch;
        }

        const minPriceMatch = filters.minPrice ? p.price >= filters.minPrice : true;
        const maxPriceMatch = filters.maxPrice ? p.price <= filters.maxPrice : true;
        const bedsMatch = filters.beds ? p.beds >= filters.beds : true;
        const bathsMatch = filters.baths ? p.baths >= filters.baths : true;
        const livingRoomsMatch = filters.livingRooms ? p.livingRooms >= filters.livingRooms : true;
        const minSqftMatch = filters.minSqft ? p.sqft >= filters.minSqft : true;
        const maxSqftMatch = filters.maxSqft ? p.sqft <= filters.maxSqft : true;
        const sellerTypeMatch = filters.sellerType !== 'any' ? p.seller.type === filters.sellerType : true;
        const propertyTypeMatch = filters.propertyType !== 'any' ? p.propertyType === filters.propertyType : true;
        
        return queryMatch && minPriceMatch && maxPriceMatch && bedsMatch && bathsMatch && livingRoomsMatch && sellerTypeMatch && propertyTypeMatch && minSqftMatch && maxSqftMatch;
    });
};
