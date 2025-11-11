import { Property, Filters, MunicipalityData } from '../types';

export const filterProperties = (properties: Property[], filters: Filters, allMunicipalities: Record<string, MunicipalityData[]>): Property[] => {
    const query = filters.query?.toLowerCase().trim();

    const allSettlements = Object.values(allMunicipalities).flat().flatMap(m => m.settlements);

    return properties.filter(p => {
        let queryMatch = true;
        if (query) {
            const addressMatch = p.address.toLowerCase().includes(query);
            
            // The property's city is now "Town, Municipality"
            const cityMatch = p.city.toLowerCase().includes(query);
            
            // Check if query matches a specific settlement or municipality name
            let settlementOrMunicipalityMatch = false;
            for (const country in allMunicipalities) {
                for (const mun of allMunicipalities[country]) {
                    // Check municipality name
                    if (mun.name.toLowerCase().includes(query) && p.city.toLowerCase().includes(mun.name.toLowerCase())) {
                        settlementOrMunicipalityMatch = true;
                        break;
                    }
                    // Check settlement names within the municipality
                    for (const set of mun.settlements) {
                         if (set.name.toLowerCase().includes(query) && p.city.toLowerCase().startsWith(set.name.toLowerCase())) {
                            settlementOrMunicipalityMatch = true;
                            break;
                         }
                    }
                    if (settlementOrMunicipalityMatch) break;
                }
                if (settlementOrMunicipalityMatch) break;
            }

            queryMatch = addressMatch || cityMatch || settlementOrMunicipalityMatch;
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
