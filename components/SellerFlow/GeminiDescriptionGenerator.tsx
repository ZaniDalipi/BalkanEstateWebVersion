import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Property, PropertyImage, PropertyImageTag, Seller, UserRole, NominatimResult } from '../../types';
import { generateDescriptionFromImages, PropertyAnalysisResult } from '../../services/geminiService';
import { searchLocation } from '../../services/osmService';
import { SparklesIcon, MapPinIcon, SpinnerIcon } from '../../constants';
import { getCurrencySymbol } from '../../utils/currency';
import { useAppContext } from '../../context/AppContext';
import WhackAnIconAnimation from './WhackAnIconAnimation';
import NumberInputWithSteppers from '../shared/NumberInputWithSteppers';
import MapLocationPicker from './MapLocationPicker';
import { BALKAN_LOCATIONS, CityData } from '../../utils/balkanLocations';

type Step = 'init' | 'loading' | 'form' | 'floorplan' | 'success';
type Mode = 'ai' | 'manual';

interface ListingData {
    streetAddress: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    livingRooms: number;
    sq_meters: number;
    year_built: number;
    parking_spots: number;
    specialFeatures: string[];
    materials: string[];
    description: string;
    image_tags: { index: number; tag: string; }[];
    tourUrl: string;
    propertyType: 'house' | 'apartment' | 'villa' | 'other';
    floorNumber: number;
    totalFloors: number;
    lat: number;
    lng: number;
}

interface ImageData {
    file: File | null;
    previewUrl: string;
}

const initialListingData: ListingData = {
    streetAddress: '',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    livingRooms: 0,
    sq_meters: 0,
    year_built: new Date().getFullYear(),
    parking_spots: 0,
    specialFeatures: [],
    materials: [],
    description: '',
    image_tags: [],
    tourUrl: '',
    propertyType: 'house',
    floorNumber: 1,
    totalFloors: 1,
    lat: 0,
    lng: 0,
};

const LANGUAGES = ['English', 'Albanian', 'Macedonian', 'Serbian', 'Bosnian', 'Croatian', 'Montenegrin', 'Bulgarian', 'Greek'];
const ALL_VALID_TAGS: PropertyImageTag[] = ['exterior', 'living_room', 'kitchen', 'bedroom', 'bathroom', 'other'];
const FREE_LISTING_LIMIT = 3;


// --- Helper Icons ---
const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const InfoIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const inputBaseClasses = "block w-full text-base bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 shadow-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors focus:bg-white";
const floatingInputClasses = "block px-2.5 pb-2.5 pt-4 w-full text-base text-neutral-900 bg-white rounded-lg border appearance-none focus:outline-none focus:ring-0 peer";
const floatingLabelClasses = "absolute text-base text-neutral-700 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 peer-focus:text-primary";
const floatingSelectLabelClasses = "absolute text-base text-neutral-700 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 start-1";

// --- Sub-components ---
const ImageTagSelector: React.FC<{
    value: string;
    options: string[];
    onChange: (tag: string) => void;
}> = ({ value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSelect = (tag: string) => {
        onChange(tag);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const selectedLabel = value ? value.replace(/_/g, ' ') : 'Select Tag';

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-700 flex justify-between items-center capitalize"
            >
                {selectedLabel}
                <svg className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {options.map(tag => (
                        <li
                            key={tag}
                            onClick={() => handleSelect(tag)}
                            className="px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 cursor-pointer capitalize"
                        >
                            {tag.replace(/_/g, ' ')}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


const TagListInput: React.FC<{
    tags: string[];
    setTags: (tags: string[]) => void;
    label: string;
}> = ({ tags, setTags, label }) => {
    const [inputValue, setInputValue] = useState('');
    const inputId = `tag-input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
             <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
            <div 
                className={`${inputBaseClasses} flex flex-wrap items-center gap-2 h-auto py-1 cursor-text`}
                onClick={() => document.getElementById(inputId)?.focus()}
            >
                {tags.map(tag => (
                    <div key={tag} className="flex items-center gap-1 bg-primary-light text-primary-dark text-sm font-semibold px-2 py-1 rounded">
                        <span>{tag}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="text-primary-dark/70 hover:text-primary-dark">&times;</button>
                    </div>
                ))}
                <input
                    id={inputId}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? "Add tags..." : ""}
                    className="flex-grow bg-transparent outline-none text-base h-8 placeholder:text-neutral-700"
                />
            </div>
        </div>
    );
};


// --- Main Component ---
const GeminiDescriptionGenerator: React.FC<{ propertyToEdit: Property | null }> = ({ propertyToEdit }) => {
    const { state, dispatch, updateUser, createListing, updateListing } = useAppContext();
    const { currentUser, properties, isPricingModalOpen, pendingProperty } = state;
    const [mode, setMode] = useState<Mode>('ai');
    const [step, setStep] = useState<Step>('init');
    const [error, setError] = useState<string | null>(null);
    const [images, setImages] = useState<ImageData[]>([]);
    const [floorplanImage, setFloorplanImage] = useState<ImageData>({ file: null, previewUrl: '' });
    const [listingData, setListingData] = useState<ListingData>(initialListingData);
    const [language, setLanguage] = useState('English');
    const [aiPropertyType, setAiPropertyType] = useState<'house' | 'apartment' | 'villa' | 'other'>('house');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Drag & Drop State
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    
    // Location State
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [availableCities, setAvailableCities] = useState<CityData[]>([]);
    
    // Track modal state to react to it closing
    const wasModalOpen = useRef(isPricingModalOpen);
    useEffect(() => {
        if (wasModalOpen.current && !isPricingModalOpen && pendingProperty) {
            if (!currentUser?.isSubscribed) {
                setError(`You've reached your free listing limit of ${FREE_LISTING_LIMIT}. Please subscribe to publish more properties.`);
            }
            dispatch({ type: 'SET_PENDING_PROPERTY', payload: null });
        }
        wasModalOpen.current = isPricingModalOpen;
    }, [isPricingModalOpen, pendingProperty, currentUser?.isSubscribed, dispatch]);

    // Populate form if editing
    useEffect(() => {
        if (propertyToEdit) {
            setMode('manual');
            setStep('form');

            const hashString = `${propertyToEdit.address}`;
            let hash = 0;
            for (let i = 0; i < hashString.length; i++) {
                const char = hashString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash |= 0;
            }
            const latOffset = Math.sin(hash) * 0.005;
            const lngOffset = Math.cos(hash) * 0.005;

            const originalLat = propertyToEdit.lat - latOffset;
            const originalLng = propertyToEdit.lng - lngOffset;

            setListingData({
                streetAddress: propertyToEdit.address,
                price: propertyToEdit.price,
                bedrooms: propertyToEdit.beds,
                bathrooms: propertyToEdit.baths,
                livingRooms: propertyToEdit.livingRooms,
                sq_meters: propertyToEdit.sqft,
                year_built: propertyToEdit.yearBuilt,
                parking_spots: propertyToEdit.parking,
                specialFeatures: propertyToEdit.specialFeatures,
                materials: propertyToEdit.materials,
                description: propertyToEdit.description,
                tourUrl: propertyToEdit.tourUrl || '',
                propertyType: propertyToEdit.propertyType || 'house',
                floorNumber: propertyToEdit.floorNumber || 0,
                totalFloors: propertyToEdit.totalFloors || 0,
                image_tags: (propertyToEdit.images || []).map((img, index) => ({ index, tag: img.tag })),
                lat: originalLat,
                lng: originalLng,
            });

            // Set country and city from property
            setSelectedCountry(propertyToEdit.country);
            setSelectedCity(propertyToEdit.city);

            // Load cities for the country
            const country = BALKAN_LOCATIONS.find(c => c.name === propertyToEdit.country);
            if (country) {
                setAvailableCities(country.cities);
            }

            const existingImages: ImageData[] = (propertyToEdit.images || []).map(img => ({ file: null, previewUrl: img.url }));
            setImages(existingImages);
            if (propertyToEdit.floorplanUrl) {
                setFloorplanImage({ file: null, previewUrl: propertyToEdit.floorplanUrl });
            }
        }
    }, [propertyToEdit]);
    
    // Handle country selection
    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryName = e.target.value;
        setSelectedCountry(countryName);
        setSelectedCity(''); // Reset city when country changes

        const country = BALKAN_LOCATIONS.find(c => c.name === countryName);
        if (country) {
            setAvailableCities(country.cities);
            // Reset coordinates when country changes
            setListingData(prev => ({ ...prev, lat: 0, lng: 0 }));
        } else {
            setAvailableCities([]);
        }
    };

    // Handle city selection
    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityName = e.target.value;
        setSelectedCity(cityName);

        const city = availableCities.find(c => c.name === cityName);
        if (city) {
            // Set coordinates to city center
            setListingData(prev => ({
                ...prev,
                lat: city.lat,
                lng: city.lng,
            }));
        }
    };

    // Zoom level for city center
    const getZoomLevel = useMemo(() => {
        return listingData.streetAddress.trim() ? 17 : 14;
    }, [listingData.streetAddress]);

    const handleMapLocationChange = (newLat: number, newLng: number) => {
        setListingData(prev => ({
            ...prev,
            lat: newLat,
            lng: newLng,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newImages: ImageData[] = files.map((file: File) => ({
                file,
                previewUrl: URL.createObjectURL(file)
            }));
            if(propertyToEdit || mode === 'manual') {
                setImages(newImages);
                setListingData(prev => ({...prev, image_tags: newImages.map((_, i) => ({index: i, tag: 'other'}))}));
            } else {
                setImages(prev => [...prev, ...newImages]);
            }
        }
    };

    const handleFloorplanImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFloorplanImage({ file, previewUrl: URL.createObjectURL(file) });
        }
    };
    
    const removeImage = (indexToRemove: number) => {
        setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
        setListingData(prev => {
            const newTags = prev.image_tags
                .filter(tag => tag.index !== indexToRemove)
                .map(tag => (tag.index > indexToRemove ? { ...tag, index: tag.index - 1 } : tag));
            return { ...prev, image_tags: newTags };
        });
    };
    
    // --- Drag & Drop Handlers ---
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItem.current = index;
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnter = (_e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragOverItem.current = index;
    };

    const handleDrop = useCallback(() => {
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
            return;
        }

        const currentTagsMap = new Map(listingData.image_tags.map(t => [t.index, t.tag]));

        const urlToTagMap = new Map<string, string>();
        images.forEach((img, index) => {
            const tag = currentTagsMap.get(index);
            if (tag) {
                urlToTagMap.set(img.previewUrl, tag);
            }
        });
        
        const reorderedImages = [...images];
        const draggedImage = reorderedImages.splice(dragItem.current, 1)[0];
        reorderedImages.splice(dragOverItem.current, 0, draggedImage);
        
        const newImageTags = reorderedImages.map((img, newIndex) => {
            const tag = urlToTagMap.get(img.previewUrl) || 'other';
            return { index: newIndex, tag: tag as PropertyImageTag };
        });

        setImages(reorderedImages);
        setListingData(prev => ({ ...prev, image_tags: newImageTags }));

    }, [images, listingData.image_tags]);


    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
        dragItem.current = null;
        dragOverItem.current = null;
    };


    const handleGenerate = async () => {
        if (images.length === 0) {
            setError('Please upload at least one image.');
            return;
        }
        setError(null);
        setStep('loading');
        try {
            const imageFiles = images.map(img => img.file).filter((f): f is File => f !== null);
            if (imageFiles.length === 0) {
                if (images.some(img => img.previewUrl)) {
                    setStep('form');
                    return;
                }
                setError("No new images were uploaded to analyze. Please add new image files.");
                setStep('init');
                return;
            }

            const result = await generateDescriptionFromImages(imageFiles, language, aiPropertyType);
            
            const validTags = result.image_tags
                .filter(tagInfo => ALL_VALID_TAGS.includes(tagInfo.tag as PropertyImageTag))
                .map(tagInfo => ({
                    ...tagInfo,
                    tag: tagInfo.tag as PropertyImageTag,
                }));

            setListingData(prev => ({
                ...prev,
                bedrooms: result.bedrooms,
                bathrooms: result.bathrooms,
                livingRooms: result.living_rooms,
                sq_meters: result.sq_meters,
                year_built: result.year_built,
                parking_spots: result.parking_spots,
                specialFeatures: [...new Set([...result.amenities, ...result.key_features])],
                materials: result.materials,
                description: result.description,
                image_tags: validTags,
                propertyType: result.property_type,
                floorNumber: result.floor_number || 0,
                totalFloors: result.total_floors || 0,
            }));
            setStep('form');
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unexpected error occurred during AI generation.');
            }
            setStep('init');
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumeric = type === 'number';
        setListingData(prev => ({
            ...prev,
            [name]: isNumeric ? (value === '' ? '' : Number(value)) : value
        }));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const numericString = rawValue.replace(/[^0-9]/g, '');
        const numberValue = numericString === '' ? 0 : Number(numericString);
        
        setListingData(prev => ({
            ...prev,
            price: numberValue
        }));
    };
    
    const handleImageTagChange = (index: number, tag: string) => {
        const newImageTags = [...listingData.image_tags];
        const existingTagIndex = newImageTags.findIndex(t => t.index === index);
        if (existingTagIndex > -1) {
            newImageTags[existingTagIndex].tag = tag;
        } else {
            newImageTags.push({ index, tag });
        }
        setListingData(prev => ({ ...prev, image_tags: newImageTags }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            setError("You must be logged in to create a listing.");
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'signup' } });
            return;
        }
        setIsSubmitting(true);
        setError(null);

        // Validation
        if (!selectedCountry || !selectedCity) {
            setError("Please select both country and city.");
            setIsSubmitting(false);
            return;
        }

        if (listingData.lat === 0 || listingData.lng === 0) {
            setError("Please select a valid city to set the location.");
            setIsSubmitting(false);
            return;
        }

        if (listingData.propertyType === 'apartment' && (!listingData.floorNumber || listingData.floorNumber < 1)) {
            setError("For apartments, please enter a valid floor number (1 or greater).");
            setIsSubmitting(false);
            return;
        }
        if ((listingData.propertyType === 'house' || listingData.propertyType === 'villa') && (!listingData.totalFloors || listingData.totalFloors < 1)) {
            setError("For houses and villas, please enter the total number of floors (1 or greater).");
            setIsSubmitting(false);
            return;
        }

        try {
            const imageUrls: PropertyImage[] = images.map((img, index) => {
                const tagInfo = listingData.image_tags.find(t => t.index === index);
                return {
                    url: img.previewUrl,
                    tag: (tagInfo?.tag as PropertyImageTag) || 'other',
                };
            });
            
            let { lat, lng } = listingData;
            
            const hashString = `${listingData.streetAddress}`;
            let hash = 0;
            for (let i = 0; i < hashString.length; i++) {
                const char = hashString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash |= 0;
            }
            const latOffset = Math.sin(hash) * 0.005;
            const lngOffset = Math.cos(hash) * 0.005;
            const finalLat = lat + latOffset;
            const finalLng = lng + lngOffset;

            // Use street address if provided, otherwise default to city name
            const finalAddress = listingData.streetAddress.trim() || selectedCity;

            const newProperty: Property = {
                id: propertyToEdit ? propertyToEdit.id : `prop-${Date.now()}`,
                sellerId: currentUser.id,
                status: 'active',
                price: Number(listingData.price),
                address: finalAddress,
                city: selectedCity,
                country: selectedCountry,
                beds: Number(listingData.bedrooms),
                baths: Number(listingData.bathrooms),
                livingRooms: Number(listingData.livingRooms),
                sqft: Number(listingData.sq_meters),
                yearBuilt: Number(listingData.year_built),
                parking: Number(listingData.parking_spots),
                description: listingData.description,
                specialFeatures: listingData.specialFeatures,
                materials: listingData.materials,
                tourUrl: listingData.tourUrl,
                imageUrl: imageUrls.length > 0 ? imageUrls[0].url : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500',
                images: imageUrls,
                lat: finalLat,
                lng: finalLng,
                seller: {
                    type: currentUser.role === UserRole.AGENT ? 'agent' : 'private',
                    name: currentUser.name,
                    phone: currentUser.phone,
                    avatarUrl: currentUser.avatarUrl,
                },
                propertyType: listingData.propertyType,
                floorNumber: Number(listingData.floorNumber) || undefined,
                totalFloors: Number(listingData.totalFloors) || undefined,
                floorplanUrl: floorplanImage.previewUrl || undefined,
                createdAt: propertyToEdit ? propertyToEdit.createdAt : Date.now(),
                lastRenewed: Date.now(),
                views: propertyToEdit?.views || 0,
                saves: propertyToEdit?.saves || 0,
                inquiries: propertyToEdit?.inquiries || 0,
            };

            if (!propertyToEdit && !currentUser.isSubscribed) {
                const userListings = properties.filter(p => p.sellerId === currentUser.id);
                if (userListings.length >= FREE_LISTING_LIMIT) {
                    dispatch({ type: 'SET_PENDING_PROPERTY', payload: newProperty });
                    dispatch({ type: 'TOGGLE_LISTING_LIMIT_WARNING', payload: true });
                    setIsSubmitting(false);
                    return;
                }
            }

            if (propertyToEdit) {
                await updateListing(newProperty);
            } else {
                await createListing(newProperty);
                 if (currentUser.role === UserRole.BUYER) {
                    await updateUser({ role: UserRole.PRIVATE_SELLER });
                }
            }

            setStep('success');
            setTimeout(() => {
                dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'account' });
            }, 3000);

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || "Failed to submit listing.");
            } else {
                setError("An unexpected error occurred while submitting.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (step === 'success') {
        return (
            <div className="text-center py-12 flex flex-col items-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-neutral-800">Listing {propertyToEdit ? 'Updated' : 'Published'} Successfully!</h3>
                <p className="text-neutral-600 mt-2">Redirecting you to your dashboard...</p>
            </div>
        )
    }

    if (step === 'loading') {
        return (
             <div className="text-center py-12 flex flex-col items-center">
                <WhackAnIconAnimation mode="loading" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-primary-light text-primary-dark/90 text-sm p-4 rounded-lg mb-6 border border-primary/20">
                <p><strong>Photo Tips:</strong> For best results, include well-lit, high-resolution photos of the exterior, kitchen, living rooms, bedrooms, and bathrooms. The more details you show, the better your AI-generated listing will be!</p>
            </div>
            <div className="flex justify-center mb-6">
                 <div className="bg-neutral-100 p-1 rounded-full flex items-center space-x-1 border border-neutral-200 shadow-sm max-w-sm">
                    <button type="button" onClick={() => setMode('ai')} className={`w-1/2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${mode === 'ai' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}><SparklesIcon className="w-4 h-4" /> AI Creator</button>
                    <button type="button" onClick={() => setMode('manual')} className={`w-1/2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${mode === 'manual' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}>Manual Entry</button>
                </div>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">{error}</div>}

            {mode === 'ai' && step === 'init' && (
                <div className="animate-fade-in">
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div className="relative">
                                <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className={`${floatingInputClasses} border-neutral-300`}>
                                    {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                </select>
                                <label htmlFor="language" className={floatingSelectLabelClasses}>Description Language</label>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                            </div>
                            <div className="relative">
                                <select id="aiPropertyType" value={aiPropertyType} onChange={(e) => setAiPropertyType(e.target.value as any)} className={`${floatingInputClasses} border-neutral-300`}>
                                    <option value="house">House</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="villa">Villa</option>
                                    <option value="other">Other</option>
                                </select>
                                <label htmlFor="aiPropertyType" className={floatingSelectLabelClasses}>Property Type</label>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                            </div>
                        </div>
                        <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer bg-neutral-50 hover:bg-neutral-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6"><UploadIcon className="w-10 h-10 mb-3 text-neutral-400" /><p className="mb-2 text-sm text-neutral-500"><span className="font-semibold">Click to upload photos</span></p><p className="text-xs text-neutral-500">PNG, JPG or WEBP</p></div>
                            <input id="image-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                        {images.length > 0 && (
                            <div className="mt-4"><p className="font-semibold text-sm mb-2">{images.length} image(s) selected:</p><div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">{images.map((img, index) => (<div key={index} className="relative group"><img src={img.previewUrl} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md" /><button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button></div>))}</div></div>
                        )}
                         <button type="button" onClick={handleGenerate} className="w-full mt-6 py-3 text-lg font-bold text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2" disabled={images.length === 0}><SparklesIcon className="w-6 h-6"/>Generate Listing</button>
                    </div>
                </div>
            )}

            {(mode === 'manual' || (mode === 'ai' && step === 'form')) && (
                 <div className="space-y-8 animate-fade-in">
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Country Dropdown */}
                        <div className="relative">
                            <select
                                id="country"
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                className={`${floatingInputClasses} border-neutral-300`}
                                required
                            >
                                <option value="">Select Country</option>
                                {BALKAN_LOCATIONS.map(country => (
                                    <option key={country.code} value={country.name}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            <label htmlFor="country" className={floatingSelectLabelClasses}>Country</label>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>

                        {/* City Dropdown */}
                        <div className="relative">
                            <select
                                id="city"
                                value={selectedCity}
                                onChange={handleCityChange}
                                className={`${floatingInputClasses} border-neutral-300`}
                                required
                                disabled={!selectedCountry}
                            >
                                <option value="">Select City</option>
                                {availableCities.map(city => (
                                    <option key={city.name} value={city.name}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                            <label htmlFor="city" className={floatingSelectLabelClasses}>City</label>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>

                        {/* Show interactive map when city is selected */}
                        {selectedCity && listingData.lat !== 0 && listingData.lng !== 0 && (
                            <div className="md:col-span-2">
                                <MapLocationPicker
                                    lat={listingData.lat}
                                    lng={listingData.lng}
                                    address={`${selectedCity}, ${selectedCountry}`}
                                    zoom={getZoomLevel}
                                    onLocationChange={handleMapLocationChange}
                                />
                            </div>
                        )}

                        <div className="relative md:col-span-2 cursor-text" onClick={() => document.getElementById('streetAddress')?.focus()}>
                            <input type="text" id="streetAddress" name="streetAddress" value={listingData.streetAddress} onChange={handleInputChange} className={`${floatingInputClasses} border-neutral-300`} placeholder=" " />
                            <label htmlFor="streetAddress" className={floatingLabelClasses}>Street Address (Optional)</label>
                            <p className="mt-1 text-xs text-neutral-500">Example: Rruga Ilir Konushevci 28 • If left empty, defaults to city center</p>
                        </div>

                        <div className="relative md:col-span-2 cursor-text" onClick={() => document.getElementById('price')?.focus()}>
                            <input type="text" id="price" inputMode="numeric" name="price" value={listingData.price > 0 ? new Intl.NumberFormat('de-DE').format(listingData.price) : ''} onChange={handlePriceChange} className={`${floatingInputClasses} border-neutral-300 pl-8`} placeholder=" " required />
                            <label htmlFor="price" className={floatingLabelClasses}>Price</label>
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">{getCurrencySymbol(selectedCountry)}</span>
                        </div>
                    </fieldset>

                    <fieldset className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"><NumberInputWithSteppers label="Bedrooms" value={listingData.bedrooms} onChange={(val) => setListingData(p => ({ ...p, bedrooms: val }))} /><NumberInputWithSteppers label="Bathrooms" value={listingData.bathrooms} onChange={(val) => setListingData(p => ({ ...p, bathrooms: val }))} /><NumberInputWithSteppers label="Living Rooms" value={listingData.livingRooms} onChange={(val) => setListingData(p => ({ ...p, livingRooms: val }))} /><NumberInputWithSteppers label="Area (m²)" value={listingData.sq_meters} step={5} onChange={(val) => setListingData(p => ({ ...p, sq_meters: val }))} /><NumberInputWithSteppers label="Year Built" value={listingData.year_built} max={new Date().getFullYear()} onChange={(val) => setListingData(p => ({ ...p, year_built: val }))} /><NumberInputWithSteppers label="Parking Spots" value={listingData.parking_spots} onChange={(val) => setListingData(p => ({ ...p, parking_spots: val }))} /></fieldset>
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end"><div className="relative"><select name="propertyType" id="propertyType" value={listingData.propertyType} onChange={handleInputChange} className={`${floatingInputClasses} border-neutral-300`}><option value="house">House</option><option value="apartment">Apartment</option><option value="villa">Villa</option><option value="other">Other</option></select><label htmlFor="propertyType" className={floatingSelectLabelClasses}>Property Type</label></div>{listingData.propertyType === 'apartment' && (<NumberInputWithSteppers label="Floor Number" value={listingData.floorNumber} onChange={(val) => setListingData(p => ({ ...p, floorNumber: val }))} min={1} />)}{(listingData.propertyType === 'house' || listingData.propertyType === 'villa') && (<NumberInputWithSteppers label="Total Floors" value={listingData.totalFloors} min={1} onChange={(val) => setListingData(p => ({ ...p, totalFloors: val }))} />)}</fieldset>
                    <fieldset><TagListInput label="Special Features" tags={listingData.specialFeatures} setTags={(tags) => setListingData(p => ({ ...p, specialFeatures: tags }))} /></fieldset>
                    <fieldset><TagListInput label="Materials" tags={listingData.materials} setTags={(tags) => setListingData(p => ({ ...p, materials: tags }))} /></fieldset>
                    <fieldset><label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">Description</label><textarea id="description" name="description" value={listingData.description} onChange={handleInputChange} className={`${inputBaseClasses} h-48`} required /></fieldset>
                    
                    <fieldset>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Image Management</label>
                        <div className="p-4 border rounded-lg bg-neutral-50/70">
                             <label htmlFor="image-upload-manual" className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-neutral-50 mb-4">
                                <div className="flex flex-col items-center justify-center">
                                    <UploadIcon className="w-8 h-8 mb-2 text-neutral-400" />
                                    <p className="text-sm text-neutral-500">{images.length > 0 ? 'Upload more or replace images' : 'Upload property images'}</p>
                                </div>
                                <input id="image-upload-manual" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>

                            {images.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 bg-blue-100 text-blue-800 text-sm p-3 rounded-lg mb-4">
                                        <InfoIcon className="w-8 h-8 flex-shrink-0"/>
                                        <p>Drag and drop images to reorder them. The first image will be the main cover photo for your listing.</p>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                                        {images.map((img, index) => (
                                            <div 
                                                key={img.previewUrl}
                                                className="relative group cursor-grab"
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragEnter={(e) => handleDragEnter(e, index)}
                                                onDragEnd={handleDragEnd}
                                                onDrop={handleDrop}
                                                onDragOver={(e) => e.preventDefault()}
                                            >
                                                <img src={img.previewUrl} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md mb-2 border" />
                                                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10">&times;</button>
                                                <ImageTagSelector
                                                    value={listingData.image_tags.find(t => t.index === index)?.tag || 'other'}
                                                    options={ALL_VALID_TAGS}
                                                    onChange={(tag) => handleImageTagChange(index, tag)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </fieldset>
                    
                    <div>
                        <h4 className="font-semibold text-neutral-800 mb-2 mt-4">Floor Plan (Optional)</h4>
                        <label htmlFor="floorplan-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-neutral-50">
                            <div className="flex flex-col items-center justify-center"><UploadIcon className="w-8 h-8 mb-2 text-neutral-400" /><p className="text-sm text-neutral-500">Upload floor plan image</p></div>
                            <input id="floorplan-upload" type="file" accept="image/*" className="hidden" onChange={handleFloorplanImageChange} />
                        </label>
                        {floorplanImage.previewUrl && (
                            <div className="mt-2 relative inline-block"><img src={floorplanImage.previewUrl} alt="floorplan" className="w-32 h-32 object-cover rounded-md" /><button type="button" onClick={() => setFloorplanImage({file: null, previewUrl: ''})} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button></div>
                        )}
                    </div>
                    
                    <div className="flex justify-end pt-4"><button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors w-full sm:w-auto">{isSubmitting ? 'Saving...' : (propertyToEdit ? 'Update Listing' : 'Publish Listing')}</button></div>
                 </div>
            )}
        </form>
    );
};

export default GeminiDescriptionGenerator;