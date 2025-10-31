
import React, { useMemo } from 'react';
import { Property, PropertyStatus } from '../../types';
import { formatPrice } from '../../utils/currency';
import { useAppContext } from '../../context/AppContext';
// FIX: Added EyeIcon and InboxIcon to imports to fix missing member errors.
import { EyeIcon, HeartIcon, InboxIcon, PencilIcon, SparklesIcon, CheckCircleIcon } from '../../constants';

const StatusBadge: React.FC<{ status: PropertyStatus }> = ({ status }) => {
    const statusStyles: Record<PropertyStatus, { bg: string, text: string, icon?: React.ReactNode }> = {
        active: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircleIcon className="w-4 h-4"/> },
        draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <PencilIcon className="w-4 h-4" /> },
        pending: { bg: 'bg-blue-100', text: 'text-blue-800' },
        sold: { bg: 'bg-neutral-200', text: 'text-neutral-700' },
    };
    const style = statusStyles[status] || statusStyles.draft;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
            {style.icon}
            <span className="capitalize">{status}</span>
        </span>
    );
};

const ListingCard: React.FC<{ property: Property; onCardClick: () => void; }> = ({ property, onCardClick }) => (
    <div 
        className="bg-white p-4 rounded-lg border border-neutral-200 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 cursor-pointer"
        onClick={onCardClick}
    >
        <img src={property.imageUrl} alt={property.address} className="w-full sm:w-40 h-32 object-cover rounded-md flex-shrink-0" />
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg text-neutral-800">{formatPrice(property.price, property.country)}</p>
                    <p className="text-sm text-neutral-600">{property.address}, {property.city}</p>
                </div>
                <StatusBadge status={property.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-neutral-500 mt-2 pt-2 border-t">
                <div className="flex items-center gap-1" title="Views"><EyeIcon className="w-4 h-4" /> {property.views || 0}</div>
                <div className="flex items-center gap-1" title="Saves"><HeartIcon className="w-4 h-4" /> {property.saves || 0}</div>
                <div className="flex items-center gap-1" title="Inquiries"><InboxIcon className="w-4 h-4" /> {property.inquiries || 0}</div>
            </div>
        </div>
        <div className="flex sm:flex-col justify-end sm:justify-center items-center gap-2 flex-shrink-0">
            <button onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 text-xs font-semibold bg-primary-light text-primary-dark rounded-full hover:bg-primary/20 transition-colors w-full sm:w-auto">Edit</button>
            <button onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 text-xs font-semibold bg-secondary/20 text-secondary-dark rounded-full hover:bg-secondary/30 transition-colors flex items-center gap-1 w-full sm:w-auto">
                <SparklesIcon className="w-4 h-4" />
                Renew
            </button>
        </div>
    </div>
);


const MyListings: React.FC<{ sellerId: string }> = ({ sellerId }) => {
    const { state, dispatch } = useAppContext();
    
    const properties = useMemo(() => 
        state.properties.filter(p => p.sellerId === sellerId)
    , [state.properties, sellerId]);

    const handleCardClick = (property: Property) => {
        dispatch({ type: 'SET_SELECTED_PROPERTY', payload: property });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-neutral-800">My Listings ({properties.length})</h3>
                <button className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-dark">+ Add New Listing</button>
            </div>
            {properties.length > 0 ? (
                <div className="space-y-4">
                    {properties.map(prop => <ListingCard key={prop.id} property={prop} onCardClick={() => handleCardClick(prop)} />)}
                </div>
            ) : (
                <div className="text-center p-8 border-2 border-dashed rounded-lg">
                    <p className="text-neutral-600">You haven't listed any properties yet.</p>
                </div>
            )}
        </div>
    );
};

export default MyListings;
