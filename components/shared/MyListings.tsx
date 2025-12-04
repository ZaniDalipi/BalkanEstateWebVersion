import React, { useMemo, useState } from 'react';
import { Property, PropertyStatus } from '../../types';
import { formatPrice } from '../../utils/currency';
import { useAppContext } from '../../context/AppContext';
import { EyeIcon, HeartIcon, InboxIcon, PencilIcon, SparklesIcon, CheckCircleIcon, ClockIcon, ArrowPathIcon, BuildingOfficeIcon, TrashIcon } from '../../constants';
import Modal from './Modal';
import ListingCardSkeleton from './ListingCardSkeleton';
import * as api from '../../services/apiService';
import PromotionModal from '../promotions/PromotionModal';

const StatusBadge: React.FC<{ status: PropertyStatus }> = ({ status }) => {
    const statusStyles: Record<PropertyStatus, { bg: string, text: string, icon?: React.ReactNode }> = {
        active: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircleIcon className="w-4 h-4"/> },
        draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <PencilIcon className="w-4 h-4" /> },
        pending: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <ClockIcon className="w-4 h-4" /> },
        sold: { bg: 'bg-neutral-200', text: 'text-neutral-700', icon: <CheckCircleIcon className="w-4 h-4" /> },
    };
    const style = statusStyles[status] || statusStyles.draft;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
            {style.icon}
            <span className="capitalize">{status}</span>
        </span>
    );
};

const ListingCard: React.FC<{
    property: Property,
    onRenew: (id: string) => void,
    onMarkAsSold: (id: string) => void,
    onDelete: (id: string) => void,
    onPromote: (id: string) => void,
}> = ({ property, onRenew, onMarkAsSold, onDelete, onPromote }) => {
    const { dispatch } = useAppContext();
    const [imageError, setImageError] = useState(false);

    const handleCardClick = () => {
        dispatch({ type: 'SET_SELECTED_PROPERTY', payload: property.id });
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'SET_PROPERTY_TO_EDIT', payload: property });
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'create-listing' });
    };

    const isActionable = property.status === 'active' || property.status === 'pending';

    return (
    <div className="bg-white p-4 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row gap-5">
        <button onClick={handleCardClick} className="block flex-shrink-0">
             {imageError ? (
                <div className="w-full sm:w-48 h-40 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center rounded-lg">
                    <BuildingOfficeIcon className="w-12 h-12 text-neutral-400" />
                </div>
            ) : (
                <img src={property.imageUrl} alt={property.address} className="w-full sm:w-48 h-40 object-cover rounded-lg" onError={() => setImageError(true)} />
            )}
        </button>
        <div className="flex-grow flex flex-col">
            <div className="flex justify-between items-start">
                <div onClick={handleCardClick} className="cursor-pointer">
                    <StatusBadge status={property.status} />
                    <p className="font-bold text-lg sm:text-xl text-neutral-800 mt-1">{formatPrice(property.price, property.country)}</p>
                    <p className="text-sm text-neutral-600">{property.address}, {property.city}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-shrink-0">
                     <button onClick={handleEditClick} className="p-2 text-neutral-500 bg-neutral-100 rounded-full hover:bg-neutral-200 hover:text-neutral-800 transition-colors">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(property.id); }} className="p-2 text-red-500 bg-red-50 rounded-full hover:bg-red-100 hover:text-red-700 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            <div className="flex-grow"></div>

            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-500 mt-3 pt-3 border-t">
                <div className="flex items-center gap-1.5" title="Views"><EyeIcon className="w-4 h-4" /> {property.views || 0}</div>
                <div className="flex items-center gap-1.5" title="Saves"><HeartIcon className="w-4 h-4" /> {property.saves || 0}</div>
                <div className="flex items-center gap-1.5" title="Inquiries"><InboxIcon className="w-4 h-4" /> {property.inquiries || 0}</div>
                {property.lastRenewed && isActionable && (
                    <div className="flex items-center gap-1.5 text-blue-600" title="Last Renewed">
                        <ClockIcon className="w-4 h-4"/>
                        <span className="text-xs font-medium">
                            {new Date(property.lastRenewed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                )}
            </div>
            
             <div className="flex flex-col sm:flex-row items-center gap-2 mt-4">
                <button
                    onClick={(e) => { e.stopPropagation(); onPromote(property.id); }}
                    disabled={!isActionable}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="w-5 h-5" />
                    Promote
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onRenew(property.id); }}
                    disabled={!isActionable}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-secondary rounded-lg hover:bg-opacity-90 transition-colors shadow-sm disabled:bg-opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                    Renew
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMarkAsSold(property.id); }}
                    disabled={!isActionable}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-green-800 bg-green-100 rounded-lg hover:bg-green-200 transition-colors shadow-sm disabled:bg-neutral-200 disabled:text-neutral-500"
                >
                    <CheckCircleIcon className="w-5 h-5" />
                    Mark as Sold
                </button>
             </div>
        </div>
    </div>
);
};

const FilterPill: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 flex-grow text-center capitalize ${
            isActive
                ? 'bg-white text-primary shadow'
                : 'text-neutral-600 hover:bg-neutral-200'
        }`}
    >
        {label}
    </button>
);


const MyListings: React.FC<{ sellerId: string }> = ({ sellerId }) => {
    const { state, dispatch } = useAppContext();
    const { isLoadingProperties } = state;
    const [showSoldConfirm, setShowSoldConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [propertyToMarkSold, setPropertyToMarkSold] = useState<string | null>(null);
    const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [propertyToPromote, setPropertyToPromote] = useState<Property | null>(null);
    
    const myProperties = useMemo(() => 
        state.properties.filter(p => p.sellerId === sellerId)
    , [state.properties, sellerId]);

    const filteredAndSortedProperties = useMemo(() => {
        const filtered = statusFilter === 'all'
            ? myProperties
            : myProperties.filter(p => p.status === statusFilter);
        
        return [...filtered].sort((a, b) => {
            const statusOrder = { active: 1, pending: 2, draft: 3, sold: 4 };
            return statusOrder[a.status] - statusOrder[b.status];
        });
    }, [myProperties, statusFilter]);

    const handleRenew = (id: string) => {
        dispatch({ type: 'RENEW_PROPERTY', payload: id });
    };

    const handleMarkAsSoldClick = (id: string) => {
        setPropertyToMarkSold(id);
        setShowSoldConfirm(true);
    };

    const confirmMarkAsSold = async () => {
        if (propertyToMarkSold) {
            try {
                await api.markPropertyAsSold(propertyToMarkSold);
                dispatch({ type: 'MARK_PROPERTY_SOLD', payload: propertyToMarkSold });
            } catch (error) {
                console.error('Failed to mark property as sold:', error);
            }
        }
        setShowSoldConfirm(false);
        setPropertyToMarkSold(null);
    };

    const handleDeleteClick = (id: string) => {
        setPropertyToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (propertyToDelete) {
            try {
                await api.deleteProperty(propertyToDelete);
                dispatch({ type: 'DELETE_PROPERTY', payload: propertyToDelete });
            } catch (error) {
                console.error('Failed to delete property:', error);
            }
        }
        setShowDeleteConfirm(false);
        setPropertyToDelete(null);
    };

    const handlePromote = (id: string) => {
        const property = myProperties.find(p => p.id === id);
        if (property) {
            setPropertyToPromote(property);
            setShowPromotionModal(true);
        }
    };

    const handlePromotionSuccess = () => {
        // Refresh properties to show updated promotion status
        // The property will be updated by the API
        setShowPromotionModal(false);
        setPropertyToPromote(null);
    };

    const filterOptions: { label: string, value: PropertyStatus | 'all' }[] = [
        { label: 'All', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Sold', value: 'sold' },
        { label: 'Draft', value: 'draft' },
    ];

    return (
        <div className="space-y-6">
            <Modal
                isOpen={showSoldConfirm}
                onClose={() => setShowSoldConfirm(false)}
                title="Confirm Action"
            >
                <p className="text-neutral-600 mb-6 text-center">Are you sure you want to mark this property as sold? This action cannot be undone.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setShowSoldConfirm(false)} className="px-6 py-2 border border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-100">Cancel</button>
                    <button onClick={confirmMarkAsSold} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Confirm</button>
                </div>
            </Modal>

            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Delete Listing"
            >
                <p className="text-neutral-600 mb-6 text-center">Are you sure you want to delete this listing? This action cannot be undone and the property will be permanently removed.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-2 border border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-100">Cancel</button>
                    <button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Delete</button>
                </div>
            </Modal>

            {propertyToPromote && (
                <PromotionModal
                    isOpen={showPromotionModal}
                    onClose={() => {
                        setShowPromotionModal(false);
                        setPropertyToPromote(null);
                    }}
                    propertyId={propertyToPromote.id}
                    propertyTitle={`${propertyToPromote.address}, ${propertyToPromote.city}`}
                    onSuccess={handlePromotionSuccess}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-800">My Listings ({myProperties.length})</h3>
                <button 
                  onClick={() => {
                      dispatch({ type: 'SET_PROPERTY_TO_EDIT', payload: null });
                      dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'create-listing' });
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                  <PencilIcon className="w-5 h-5"/>
                  <span>Add New Listing</span>
                </button>
            </div>

            <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-full border border-neutral-200 self-start max-w-full sm:max-w-lg overflow-x-auto">
                {filterOptions.map(option => (
                    <FilterPill
                        key={option.value}
                        label={option.label}
                        isActive={statusFilter === option.value}
                        onClick={() => setStatusFilter(option.value)}
                    />
                ))}
            </div>

            {isLoadingProperties ? (
                <div className="space-y-4">
                    <ListingCardSkeleton />
                    <ListingCardSkeleton />
                    <ListingCardSkeleton />
                </div>
            ) : filteredAndSortedProperties.length > 0 ? (
                <div className="space-y-4">
                    {filteredAndSortedProperties.map(prop =>
                        <ListingCard
                            key={prop.id}
                            property={prop}
                            onRenew={handleRenew}
                            onMarkAsSold={handleMarkAsSoldClick}
                            onDelete={handleDeleteClick}
                            onPromote={handlePromote}
                        />
                    )}
                </div>
            ) : (
                <div className="text-center p-12 border-2 border-dashed rounded-lg bg-neutral-50">
                    {myProperties.length > 0 ? (
                         <>
                            <h4 className="text-xl font-semibold text-neutral-700">No Listings Found</h4>
                            <p className="text-neutral-500 mt-2">No properties match the "{statusFilter}" filter. Try selecting "All".</p>
                        </>
                    ) : (
                        <>
                            <h4 className="text-xl font-semibold text-neutral-700">No Listings Yet</h4>
                            <p className="text-neutral-500 mt-2">Click "Add New Listing" to get started.</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyListings;
