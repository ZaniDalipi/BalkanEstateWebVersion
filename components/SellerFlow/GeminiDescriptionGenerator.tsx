import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Property, PropertyImage, PropertyImageTag, Seller, UserRole } from '../../types';
import { generateDescriptionFromImages, PropertyAnalysisResult } from '../../services/geminiService';
import { CITY_DATA } from '../../services/propertyService';
import { SparklesIcon } from '../../constants';
import { getCurrencySymbol } from '../../utils/currency';
import { useAppContext } from '../../context/AppContext';

type Step = 'init' | 'loading' | 'form' | 'floorplan' | 'success';
type Mode = 'ai' | 'manual';

interface ListingData {
    address: string;
    city: string;
    country: string;
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
}

interface ImageData {
    file: File | null;
    previewUrl: string;
}

const initialListingData: ListingData = {
    address: '',
    city: '',
    country: '',
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
    floorNumber: 0,
    totalFloors: 0,
};

const INITIAL_ROOM_TAGS: PropertyImageTag[] = ['bedroom', 'bathroom', 'kitchen', 'living_room', 'exterior', 'other'];
const LANGUAGES = ['English', 'Albanian', 'Macedonian', 'Serbian', 'Bosnian', 'Croatian', 'Montenegrin', 'Bulgarian', 'Greek'];
const ALL_VALID_TAGS: PropertyImageTag[] = ['exterior', 'living_room', 'kitchen', 'bedroom', 'bathroom', 'other'];


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
const floatingLabelClasses = "absolute text-base text-neutral-700 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 peer-focus:text-primary";
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
             <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
            <div className={`${inputBaseClasses} flex flex-wrap items-center gap-2 h-auto py-1`}>
                {tags.map(tag => (
                    <div key={tag} className="flex items-center gap-1 bg-primary-light text-primary-dark text-sm font-semibold px-2 py-1 rounded">
                        <span>{tag}</span>
                        <button type="button" onClick={() => removeTag(tag)} className="text-primary-dark/70 hover:text-primary-dark">&times;</button>
                    </div>
                ))}
                <input
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
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;
    const [mode, setMode] = useState<Mode>('ai');
    const [step, setStep] = useState<Step>('init');
    const [error, setError] = useState<string | null>(null);
    const [images, setImages] = useState<ImageData[]>([]);
    const [floorplanImage, setFloorplanImage] = useState<ImageData>({ file: null, previewUrl: '' });
    const [listingData, setListingData] = useState<ListingData>(initialListingData);
    const [language, setLanguage] = useState('English');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableCountries = useMemo(() => Object.keys(CITY_DATA).sort(), []);
    const [selectedCountry, setSelectedCountry] = useState(propertyToEdit ? propertyToEdit.country : '');
    
    const availableCities = useMemo(() => {
        if (!selectedCountry || !CITY_DATA[selectedCountry]) return [];
        return CITY_DATA[selectedCountry].map(city => city.name).sort();
    }, [selectedCountry]);

    // Populate form if editing
    useEffect(() => {
        if (propertyToEdit) {
            setMode('manual');
            setStep('form');
            setListingData({
                address: propertyToEdit.address,
                city: propertyToEdit.city,
                country: propertyToEdit.country,
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
                image_tags: [], // Images are handled separately
            });
            setSelectedCountry(propertyToEdit.country);
            // Can't easily reconstruct the image files, so we'll just show the URLs
            // FIX: Explicitly type `existingImages` as `ImageData[]` to prevent incorrect type inference
            // where `file: null` was being treated as `file: unknown`.
            const existingImages: ImageData[] = (propertyToEdit.images || []).map(img => ({ file: null, previewUrl: img.url }));
            setImages(existingImages);
            if (propertyToEdit.floorplanUrl) {
                setFloorplanImage({ file: null, previewUrl: propertyToEdit.floorplanUrl });
            }
        }
    }, [propertyToEdit, availableCountries]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).slice(0, 10); // Limit to 10 images
            // FIX: Explicitly type `file` as `File` in the map function to prevent it from being inferred
            // as `unknown`, which caused an error with `URL.createObjectURL`.
            const newImages: ImageData[] = files.map((file: File) => ({
                file,
                previewUrl: URL.createObjectURL(file)
            }));
            setImages(newImages);
        }
    };

    const handleFloorplanImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFloorplanImage({ file, previewUrl: URL.createObjectURL(file) });
        }
    };
    
    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
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
                setError("No new images were uploaded to analyze. Please add new image files.");
                setStep('init');
                return;
            }

            const result = await generateDescriptionFromImages(imageFiles, language);
            
            const validTags = result.image_tags
                .filter(tagInfo => ALL_VALID_TAGS.includes(tagInfo.tag as PropertyImageTag))
                .map(tagInfo => ({
                    ...tagInfo,
                    tag: tagInfo.tag as PropertyImageTag,
                }));

            setListingData({
                address: '',
                city: '',
                country: '',
                price: 0,
                bedrooms: result.bedrooms,
                bathrooms: result.bathrooms,
                livingRooms: result.living_rooms,
                sq_meters: result.sq_meters,
                year_built: result.year_built,
                parking_spots: result.parking_spots,
                specialFeatures: [...result.amenities, ...result.key_features],
                materials: result.materials,
                description: result.description,
                image_tags: validTags,
                tourUrl: '',
                propertyType: result.property_type,
                floorNumber: result.floor_number || 0,
                totalFloors: result.total_floors || 0,
            });
            setStep('form');
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
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
        // Remove dots and any other non-digit characters to get the number
        const numericString = rawValue.replace(/[^0-9]/g, '');
        const numberValue = numericString === '' ? 0 : Number(numericString);
        
        setListingData(prev => ({
            ...prev,
            price: numberValue
        }));
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCountry(e.target.value);
        setListingData(prev => ({ ...prev, city: '' })); // Reset city on country change
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

        try {
            // In a real app, you'd upload images to a storage service and get back URLs.
            // Here, we'll just use the preview URLs for simplicity.
            const imageUrls: PropertyImage[] = images.map((img, index) => {
                const tagInfo = listingData.image_tags.find(t => t.index === index);
                return {
                    url: img.previewUrl,
                    tag: (tagInfo?.tag as PropertyImageTag) || 'other',
                };
            });
            
            const finalCountry = selectedCountry;
            const finalCity = listingData.city;

            if (!finalCountry || !finalCity) {
                setError("Please select a country and city.");
                setIsSubmitting(false);
                return;
            }

            const newProperty: Property = {
                id: propertyToEdit ? propertyToEdit.id : `prop-${Date.now()}`,
                sellerId: currentUser.id,
                status: 'active',
                price: Number(listingData.price),
                address: listingData.address,
                city: finalCity,
                country: finalCountry,
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
                lat: CITY_DATA[finalCountry]?.find(c => c.name === finalCity)?.lat || 0,
                lng: CITY_DATA[finalCountry]?.find(c => c.name === finalCity)?.lng || 0,
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

            if (propertyToEdit) {
                dispatch({ type: 'UPDATE_PROPERTY', payload: newProperty });
            } else {
                dispatch({ type: 'ADD_PROPERTY', payload: newProperty });
                // Show pricing offer after first listing
                dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: true, isOffer: true } });
            }

            setStep('success');
            setTimeout(() => {
                dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'account' });
            }, 3000);

        } catch (err: any) {
            setError(err.message || "Failed to submit listing.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // RENDER LOGIC
    if (step === 'success') {
        return (
            <div className="text-center py-12 flex flex-col items-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-neutral-800">Listing {propertyToEdit ? 'Updated' : 'Published'} Successfully!</h3>
                <p className="text-neutral-600 mt-2">Redirecting you to your dashboard...</p>
            </div>
        )
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

            {/* --- AI MODE --- */}
            {mode === 'ai' && step !== 'form' && (
                <div className="animate-fade-in">
                    {step === 'loading' && (
                         <div className="text-center py-12 flex flex-col items-center">
                            <SparklesIcon className="w-12 h-12 text-primary animate-pulse" />
                            <h3 className="text-xl font-bold text-neutral-800 mt-4">Analyzing Property...</h3>
                            <p className="text-neutral-600 mt-2">Our AI is generating your property description, categorizing rooms, and extracting key features. This may take a moment.</p>
                        </div>
                    )}
                    {step === 'init' && (
                        <div>
                            <div className="relative mb-4">
                                <select
                                    id="language"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className={`${floatingInputClasses} border-neutral-300`}
                                >
                                    {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                </select>
                                <label htmlFor="language" className={floatingSelectLabelClasses}>Description Language</label>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                            <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer bg-neutral-50 hover:bg-neutral-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadIcon className="w-10 h-10 mb-3 text-neutral-400" />
                                    <p className="mb-2 text-sm text-neutral-500"><span className="font-semibold">Click to upload photos</span></p>
                                    <p className="text-xs text-neutral-500">PNG, JPG or WEBP (MAX. 10 images)</p>
                                </div>
                                <input id="image-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                            {images.length > 0 && (
                                <div className="mt-4">
                                    <p className="font-semibold text-sm mb-2">{images.length} image(s) selected:</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                        {images.map((img, index) => (
                                            <div key={index} className="relative group">
                                                <img src={img.previewUrl} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                                                <button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                             <button type="button" onClick={handleGenerate} className="w-full mt-6 py-3 text-lg font-bold text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2" disabled={images.length === 0}>
                                <SparklesIcon className="w-6 h-6"/>
                                Generate Listing
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* --- MANUAL MODE OR AI FORM STEP --- */}
            {(mode === 'manual' || (mode === 'ai' && step === 'form')) && (
                 <div className="space-y-8 animate-fade-in">
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="md:col-span-2">
                             <div className="relative">
                                <input type="text" name="address" value={listingData.address} onChange={handleInputChange} className={`${floatingInputClasses} border-neutral-300`} placeholder=" " required />
                                <label htmlFor="address" className={floatingLabelClasses}>Address</label>
                            </div>
                         </div>
                         <div className="relative md:col-span-2">
                            <input 
                                type="text"
                                inputMode="numeric"
                                name="price" 
                                value={listingData.price > 0 ? new Intl.NumberFormat('de-DE').format(listingData.price) : ''} 
                                onChange={handlePriceChange} 
                                className={`${floatingInputClasses} border-neutral-300 pl-8`} 
                                placeholder=" " 
                                required 
                            />
                            <label htmlFor="price" className={floatingLabelClasses}>Price</label>
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">{getCurrencySymbol(selectedCountry)}</span>
                        </div>
                        <div className="relative">
                            <select id="country" name="country" value={selectedCountry} onChange={handleCountryChange} className={`${floatingInputClasses} border-neutral-300`} required>
                                <option value="" disabled>Select a country</option>
                                {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <label htmlFor="country" className={floatingSelectLabelClasses}>Country</label>
                        </div>
                        <div className="relative">
                            <select id="city" name="city" value={listingData.city} onChange={handleInputChange} className={`${floatingInputClasses} border-neutral-300`} disabled={!selectedCountry} required>
                                <option value="" disabled>Select a city</option>
                                {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <label htmlFor="city" className={floatingSelectLabelClasses}>City</label>
                        </div>
                    </fieldset>

                    <fieldset className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="relative">
                            <input type="number" name="bedrooms" value={listingData.bedrooms || ''} onChange={handleInputChange} className={`${floatingInputClasses} border-neutral-300`} placeholder=" " min="0" />
                            <label htmlFor="bedrooms" className={floatingLabelClasses}>Bedrooms</label>
                        </div>
                        <div className="relative">
                            <input type="number" name="bathrooms" value={listingData.bathrooms || ''} onChange={handleInputChange} className={`${floatingInputClasses} border-neutral-300`} placeholder=" " min="0" />
                            <label htmlFor="bathrooms" className={floatingLabelClasses}>Bathrooms</label>
                        </div>
                         <div className="relative">
                            <input type="number" name="livingRooms" value={listingData.livingRooms || ''} onChange={handleInputChange} className={`${floatingInputClasses} border-neutral-300`} placeholder=" " min="0" />
                            <label htmlFor="livingRooms" className={floatingLabelClasses}>Living Rooms</label>
                        </div>
                    </fieldset>
                    
                     <fieldset className="grid grid-cols-2 md:grid-cols-3 gap-6">
                         <div className="relative">
                            <input type="number" name="sq_meters" value={listingData.sq_meters || ''} onChange={handleInputChange} className={`${floatingInputClasses} border-neutral-300`} placeholder=" " min="0" />
                            <label htmlFor="sq_meters" className={floatingLabelClasses}>Area (m²)</label>
                        </div>
                        <div className="relative">
                            <input type="number" name="year_built" value={listingData.year_built || ''} onChange={handleInputChange} className={`${floatingInputClasses} border-neutral-300`} placeholder=" " min="1800" max={new Date().getFullYear()} />
                            <label htmlFor="year_built" className={floatingLabelClasses}>Year Built</label>
                        </div>
                         <div className="relative">
                            <input type="number" name="parking_spots" value={listingData.parking_spots || ''} onChange={handleInputChange} className={`${floatingInputClasses} border-neutral-300`} placeholder=" " min="0" />
                            <label htmlFor="parking_spots" className={floatingLabelClasses}>Parking Spots</label>
                        </div>
                    </fieldset>

                     <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="relative">
                            <select name="propertyType" id="propertyType" value={listingData.propertyType} onChange={handleInputChange} className={`${floatingInputClasses} border-neutral-300`}>
                                <option value="house">House</option>
                                <option value="apartment">Apartment</option>
                                <option value="villa">Villa</option>
                                <option value="other">Other</option>
                            </select>
                            <label htmlFor="propertyType" className={floatingSelectLabelClasses}>Property Type</label>
                        </div>
                        {listingData.propertyType === 'apartment' && (
                            <div className="relative">
                                <input type="number" name="floorNumber" value={listingData.floorNumber || ''} onChange={handleInputChange} className={`${floatingInputClasses} border-neutral-300`} placeholder=" " min="0" />
                                <label htmlFor="floorNumber" className={floatingLabelClasses}>Floor Number</label>
                            </div>
                        )}
                         {(listingData.propertyType === 'house' || listingData.propertyType === 'villa') && (
                            <div className="relative">
                                <input type="number" name="totalFloors" value={listingData.totalFloors || ''} onChange={handleInputChange} className={`${floatingInputClasses} border-neutral-300`} placeholder=" " min="0" />
                                <label htmlFor="totalFloors" className={floatingLabelClasses}>Total Floors</label>
                            </div>
                        )}
                    </fieldset>
                    
                    <fieldset>
                        <TagListInput label="Special Features" tags={listingData.specialFeatures} setTags={(tags) => setListingData(p => ({ ...p, specialFeatures: tags }))} />
                    </fieldset>
                     <fieldset>
                        <TagListInput label="Materials" tags={listingData.materials} setTags={(tags) => setListingData(p => ({ ...p, materials: tags }))} />
                    </fieldset>

                    <fieldset>
                         <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                         <textarea name="description" value={listingData.description} onChange={handleInputChange} className={`${inputBaseClasses} h-48`} required />
                    </fieldset>

                     <fieldset>
                         <label className="block text-sm font-medium text-neutral-700 mb-1">Image Management</label>
                         <div className="p-4 border rounded-lg bg-neutral-50/70">
                            {mode === 'ai' && images.length > 0 && (
                                <div className="mb-4">
                                     <h4 className="font-semibold text-neutral-800 mb-2">Tag Your Images</h4>
                                      <div className="flex items-center gap-2 bg-blue-100 text-blue-800 text-sm p-3 rounded-lg mb-4">
                                        <InfoIcon className="w-8 h-8 flex-shrink-0"/>
                                        <p>AI has suggested tags for your images. Please review and adjust them as needed to ensure they are accurate.</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {images.map((img, index) => (
                                            <div key={index}>
                                                <img src={img.previewUrl} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md mb-2" />
                                                <ImageTagSelector
                                                    value={listingData.image_tags.find(t => t.index === index)?.tag || ''}
                                                    options={INITIAL_ROOM_TAGS}
                                                    onChange={(tag) => handleImageTagChange(index, tag)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                             {mode === 'manual' && (
                                <div className="mb-4">
                                    <label htmlFor="image-upload-manual" className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-neutral-50">
                                        <div className="flex flex-col items-center justify-center">
                                            <UploadIcon className="w-8 h-8 mb-2 text-neutral-400" />
                                            <p className="text-sm text-neutral-500">Upload or replace images</p>
                                        </div>
                                        <input id="image-upload-manual" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                    {images.length > 0 && (
                                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                            {images.map((img, index) => (
                                                <div key={index} className="relative group">
                                                    <img src={img.previewUrl} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                             <div>
                                <h4 className="font-semibold text-neutral-800 mb-2 mt-4">Floor Plan (Optional)</h4>
                                <label htmlFor="floorplan-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-neutral-50">
                                    <div className="flex flex-col items-center justify-center">
                                        <UploadIcon className="w-8 h-8 mb-2 text-neutral-400" />
                                        <p className="text-sm text-neutral-500">Upload floor plan image</p>
                                    </div>
                                    <input id="floorplan-upload" type="file" accept="image/*" className="hidden" onChange={handleFloorplanImageChange} />
                                </label>
                                {floorplanImage.previewUrl && (
                                    <div className="mt-2 relative inline-block">
                                        <img src={floorplanImage.previewUrl} alt="floorplan" className="w-32 h-32 object-cover rounded-md" />
                                         <button type="button" onClick={() => setFloorplanImage({file: null, previewUrl: ''})} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </fieldset>
                    
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors w-full sm:w-auto">
                            {isSubmitting ? 'Saving...' : (propertyToEdit ? 'Update Listing' : 'Publish Listing')}
                        </button>
                    </div>
                 </div>
            )}
        </form>
    );
};

export default GeminiDescriptionGenerator;