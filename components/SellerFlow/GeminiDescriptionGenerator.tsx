import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Property, PropertyImage, PropertyImageTag, Seller, UserRole } from '../../types';
import { generateDescriptionFromImages, PropertyAnalysisResult } from '../../services/geminiService';
import { sellers, CITY_DATA } from '../../services/propertyService';
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
    sq_meters: number;
    year_built: number;
    parking_spots: number;
    specialFeatures: string[];
    materials: string[];
    description: string;
    image_tags: { index: number; tag: string; }[];
    tourUrl: string;
    propertyType: 'house' | 'apartment' | 'villa' | 'other';
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
    sq_meters: 0,
    year_built: new Date().getFullYear(),
    parking_spots: 0,
    specialFeatures: [],
    materials: [],
    description: '',
    image_tags: [],
    tourUrl: '',
    propertyType: 'house',
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
const floatingLabelClasses = "absolute text-base duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1";
const floatingSelectLabelClasses = "absolute text-base text-neutral-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 start-1";

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
                className="w-full mt-2 bg-white border border-neutral-300 rounded-lg text-neutral-700 px-3 py-1.5 text-xs font-medium flex justify-between items-center hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
                <span className="capitalize truncate">{selectedLabel}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute bottom-full mb-1 w-full bg-white border border-neutral-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                    {options.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => handleSelect(tag)}
                            className="block w-full text-left px-3 py-2 text-xs text-neutral-700 hover:bg-primary-light hover:text-primary-dark capitalize"
                        >
                            {tag.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


const ChipInput = React.memo<{
    label: string;
    items: string[];
    onItemsChange: (items: string[]) => void;
    placeholder: string;
}>(({ label, items, onItemsChange, placeholder }) => {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }, []);

    const handleAddItem = useCallback(() => {
        const trimmed = inputValue.trim();
        if (trimmed && !items.includes(trimmed)) {
            onItemsChange([...items, trimmed]);
            setInputValue('');
        }
    }, [inputValue, items, onItemsChange]);
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem();
        }
    };

    const handleRemoveItem = (itemToRemove: string) => {
        onItemsChange(items.filter(item => item !== itemToRemove));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={inputBaseClasses}
                />
                <button type="button" onClick={handleAddItem} className="px-4 py-2.5 bg-primary-light text-primary-dark font-semibold rounded-lg hover:bg-primary/20 transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
                {items.map(item => (
                    <span key={item} className="bg-neutral-200 text-neutral-800 font-medium px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {item}
                        <button type="button" onClick={() => handleRemoveItem(item)} className="text-neutral-500 hover:text-neutral-800">&times;</button>
                    </span>
                ))}
            </div>
        </div>
    );
});


const ModeToggle: React.FC<{mode: Mode, onModeChange: (mode: Mode) => void}> = ({ mode, onModeChange }) => (
    <div className="bg-neutral-100 p-1 rounded-full flex items-center space-x-1 border border-neutral-200 shadow-sm max-w-sm mx-auto mb-6">
        <button
            onClick={() => onModeChange('ai')}
            className={`w-1/2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'ai' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}
        ><SparklesIcon className="w-4 h-4" /> AI Assisted</button>
        <button
            onClick={() => onModeChange('manual')}
            className={`w-1/2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'manual' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}
        >Manual Entry</button>
    </div>
);
    
const InitStep: React.FC<{
    mode: Mode, onModeChange: (mode: Mode) => void,
    language: string, onLanguageChange: (lang: string) => void,
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    imageData: ImageData[], onRemoveImage: (index: number) => void,
    onGenerate: () => void, error: string,
}> = ({ mode, onModeChange, language, onLanguageChange, onImageChange, imageData, onRemoveImage, onGenerate, error }) => (
     <div className="space-y-6">
        <ModeToggle mode={mode} onModeChange={onModeChange} />
        <div className="p-6 bg-primary-light border border-primary/20 rounded-lg">
            <h3 className="text-md font-bold text-primary-dark">Tips for the Best AI Results</h3>
            <ul className="list-disc list-inside text-primary-dark/80 mt-2 text-sm space-y-1">
                <li>Upload clear, well-lit photos of each main room.</li>
                <li>Include photos of the property's exterior and any special features (balcony, garden).</li>
            </ul>
        </div>
        <div className="relative">
             <select id="language-select" value={language} onChange={(e) => onLanguageChange(e.target.value)} className={`${floatingInputClasses} border-neutral-300 focus:border-primary`}>
                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
             </select>
             <label htmlFor="language-select" className={`${floatingSelectLabelClasses} flex items-center gap-1.5 text-neutral-500`}>
                Description Language
                <span title="Selecting a language will tailor the AI-generated property description for that specific region and audience.">
                   <InfoIcon className="w-4 h-4 text-neutral-400 cursor-help" />
                </span>
             </label>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Property Images</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-neutral-400" />
                    <div className="flex text-sm text-neutral-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark"><input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={onImageChange} /><span>Upload files</span></label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                </div>
            </div>
        </div>

        {imageData.length > 0 && (
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {imageData.map((img, index) => (
                    <div key={index} className="relative group">
                        <img src={img.previewUrl} alt={`preview ${index}`} className="h-24 w-24 object-cover rounded-md shadow-sm" />
                        <button onClick={() => onRemoveImage(index)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs leading-none transform -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                    </div>
                ))}
            </div>
        )}
        
        <button onClick={onGenerate} disabled={imageData.filter(i => i.file).length === 0} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-primary hover:bg-primary-dark disabled:bg-opacity-50 disabled:cursor-not-allowed">Generate with AI</button>
        {error && <p className="text-red-600 text-sm text-center font-medium bg-red-50 p-3 rounded-md">{error}</p>}
    </div>
);
    
const LoadingStep = () => (
    <div className="text-center py-12 flex flex-col items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-lg font-semibold text-neutral-700">Analyzing your property...</p>
        <p className="text-neutral-500">This may take a moment.</p>
    </div>
);

const FormStep: React.FC<{
    listingData: ListingData;
    mode: Mode;
    isEditing: boolean;
    formErrors: Record<string, string>;
    onModeChange: (mode: Mode) => void;
    handleDataChange: (field: keyof ListingData, value: any) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleImageTagChange: (index: number, tag: string) => void;
    imageData: ImageData[];
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: (index: number) => void;
    onReorderImages: (dragIndex: number, hoverIndex: number) => void;
    availableTags: string[];
    newTagInput: string;
    onNewTagInputChange: (value: string) => void;
    onAddNewTag: () => void;
    onStartOver: () => void;
    onNextStep: () => void;
    onBack: () => void;
    availableCountries: string[];
}> = ({ listingData, mode, isEditing, formErrors, onModeChange, handleDataChange, handleInputChange, handleImageTagChange, imageData, onImageChange, onRemoveImage, onReorderImages, availableTags, newTagInput, onNewTagInputChange, onAddNewTag, onStartOver, onNextStep, onBack, availableCountries }) => {

    const onChipItemsChange = useCallback((items: string[]) => handleDataChange('specialFeatures', items), [handleDataChange]);
    const onMaterialsChange = useCallback((items: string[]) => handleDataChange('materials', items), [handleDataChange]);
    const draggedItemIndex = useRef<number | null>(null);
    const dragOverItemIndex = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        draggedItemIndex.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragOverItemIndex.current = index;
    };
    const handleDragEnd = () => {
        if (draggedItemIndex.current !== null && dragOverItemIndex.current !== null && draggedItemIndex.current !== dragOverItemIndex.current) {
            onReorderImages(draggedItemIndex.current, dragOverItemIndex.current);
        }
        draggedItemIndex.current = null;
        dragOverItemIndex.current = null;
    };


    const citiesForSelectedCountry = useMemo(() => {
        if (!listingData.country || !CITY_DATA[listingData.country]) {
            return [];
        }
        return CITY_DATA[listingData.country].map(c => c.name);
    }, [listingData.country]);

    return (
        <div className="space-y-8 animate-fade-in">
            {!isEditing && <ModeToggle mode={mode} onModeChange={onModeChange} />}
            {mode === 'ai' && <p className="text-center text-neutral-600 -mt-4 mb-4">The AI has generated the details below. Review and edit as needed.</p>}
            {isEditing && <p className="text-center text-neutral-600 -mt-4 mb-4">You are editing an existing listing. Make your changes and save.</p>}

            <fieldset className="space-y-4 rounded-lg border p-6">
                <legend className="text-lg font-semibold px-2 text-neutral-800">Location & Price</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pt-4">
                    <div className="relative">
                         <select id="country" name="country" value={listingData.country} onChange={handleInputChange} className={`${floatingInputClasses} peer ${formErrors.country ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-primary'}`} required>
                            <option value="" disabled>Select a country</option>
                           {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <label htmlFor="country" className={`${floatingSelectLabelClasses} ${formErrors.country ? 'text-red-500' : 'text-neutral-500'}`}>Country</label>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                        {formErrors.country && <p className="text-xs text-red-600 mt-1">{formErrors.country}</p>}
                    </div>
                     <div className="relative">
                        <select id="city" name="city" value={listingData.city} onChange={handleInputChange} className={`${floatingInputClasses} peer ${formErrors.city ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-primary'}`} required disabled={!listingData.country}>
                            <option value="" disabled>Select a city</option>
                            {citiesForSelectedCountry.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <label htmlFor="city" className={`${floatingSelectLabelClasses} ${formErrors.city ? 'text-red-500' : 'text-neutral-500'}`}>City</label>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                        {formErrors.city && <p className="text-xs text-red-600 mt-1">{formErrors.city}</p>}
                    </div>

                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                            <span className="text-neutral-500">{getCurrencySymbol(listingData.country)}</span>
                        </div>
                        <input type="text" id="price" name="price" value={listingData.price > 0 ? listingData.price.toLocaleString('de-DE') : ''} onChange={handleInputChange} placeholder=" " className={`${floatingInputClasses} pl-12 peer ${formErrors.price ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-primary'}`} />
                        <label htmlFor="price" className={`${floatingLabelClasses} ${formErrors.price ? 'text-red-500 peer-focus:text-red-500' : 'text-neutral-500 peer-focus:text-primary'}`}>Price</label>
                        {formErrors.price && <p className="text-xs text-red-600 mt-1">{formErrors.price}</p>}
                    </div>
                    <div className="md:col-span-2 relative">
                        <input id="address" name="address" value={listingData.address} onChange={handleInputChange} className={`${floatingInputClasses} peer ${formErrors.address ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-primary'}`} placeholder=" "/>
                        <label htmlFor="address" className={`${floatingLabelClasses} ${formErrors.address ? 'text-red-500 peer-focus:text-red-500' : 'text-neutral-500 peer-focus:text-primary'}`}>Address</label>
                        {formErrors.address && <p className="text-xs text-red-600 mt-1">{formErrors.address}</p>}
                    </div>
                    <div className="md:col-span-2 relative">
                        <input type="text" id="tourUrl" name="tourUrl" value={listingData.tourUrl} onChange={handleInputChange} className={`${floatingInputClasses} peer border-neutral-300 focus:border-primary`} placeholder=" " />
                         <label htmlFor="tourUrl" className={`${floatingLabelClasses} text-neutral-500 peer-focus:text-primary`}>3D Tour URL (Optional)</label>
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-4 rounded-lg border p-6">
                 <legend className="text-lg font-semibold px-2 text-neutral-800">Property Details</legend>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-8 pt-4">
                    <div><label htmlFor="bedrooms" className="block text-sm font-medium text-neutral-700 mb-1">Bedrooms</label><input type="number" id="bedrooms" name="bedrooms" min="0" value={listingData.bedrooms} onChange={handleInputChange} className={`${inputBaseClasses} border-neutral-300 focus:border-primary`} /></div>
                    <div><label htmlFor="bathrooms" className="block text-sm font-medium text-neutral-700 mb-1">Bathrooms</label><input type="number" id="bathrooms" name="bathrooms" min="0" value={listingData.bathrooms} onChange={handleInputChange} className={`${inputBaseClasses} border-neutral-300 focus:border-primary`} /></div>
                    <div><label htmlFor="sq_meters" className="block text-sm font-medium text-neutral-700 mb-1">Area (m²)</label><input type="number" id="sq_meters" name="sq_meters" min="0" value={listingData.sq_meters} onChange={handleInputChange} className={`${inputBaseClasses} ${formErrors.sq_meters ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-primary'}`} /><p className="text-xs text-red-600 mt-1">{formErrors.sq_meters}</p></div>
                    <div><label htmlFor="year_built" className="block text-sm font-medium text-neutral-700 mb-1">Year Built</label><input type="number" id="year_built" name="year_built" min="0" value={listingData.year_built} onChange={handleInputChange} className={inputBaseClasses} /></div>
                    <div><label htmlFor="parking_spots" className="block text-sm font-medium text-neutral-700 mb-1">Parking</label><input type="number" id="parking_spots" name="parking_spots" min="0" value={listingData.parking_spots} onChange={handleInputChange} className={inputBaseClasses} /></div>
                    <div className="col-span-2 md:col-span-5">
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Property Type</label>
                        <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-full border border-neutral-200">
                            {(['house', 'apartment', 'villa', 'other'] as const).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleDataChange('propertyType', type)}
                                    className={`px-2.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 flex-grow text-center capitalize ${
                                        listingData.propertyType === type
                                        ? 'bg-white text-primary shadow'
                                        : 'text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </fieldset>
            
            <fieldset className="space-y-4 rounded-lg border p-6">
                 <legend className="text-lg font-semibold px-2 text-neutral-800">Features & Materials</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <ChipInput label="Special Features" items={listingData.specialFeatures} onItemsChange={onChipItemsChange} placeholder="e.g., Heated Pool"/>
                    <ChipInput label="Building Materials" items={listingData.materials} onItemsChange={onMaterialsChange} placeholder="e.g., Brick"/>
                </div>
            </fieldset>
            
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea id="description" name="description" rows={6} value={listingData.description} onChange={handleInputChange} className={`${inputBaseClasses} border-neutral-300 focus:border-primary`} />
            </div>
            
            <div>
                <h4 className="font-semibold text-neutral-700 mb-2">Property Images & Tags</h4>
                {formErrors.images && <p className="text-red-600 text-sm mb-2 font-semibold bg-red-50 p-3 rounded-md">{formErrors.images}</p>}
                <div className="mt-1 mb-4 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
                     <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-neutral-400" />
                        <label htmlFor="file-upload-form" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark"><input id="file-upload-form" name="file-upload-form" type="file" className="sr-only" multiple accept="image/*" onChange={onImageChange} /><span>Upload more images</span></label>
                    </div>
                </div>
                {imageData.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imageData.map((img, index) => (
                            <div 
                                key={img.previewUrl} 
                                className="relative group cursor-grab"
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <img src={img.previewUrl} alt={`preview ${index}`} className="h-32 w-full object-cover rounded-md shadow-sm border" />
                                <button type="button" onClick={() => onRemoveImage(index)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs leading-none transform -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                 <ImageTagSelector
                                    value={listingData.image_tags.find(t => t.index === index)?.tag || ''}
                                    options={availableTags}
                                    onChange={(tag) => handleImageTagChange(index, tag)}
                                />
                            </div>
                        ))}
                    </div>
                ) : <p className="text-center text-neutral-500">Upload images to see them here.</p>}
                 <div className="mt-4 p-4 bg-neutral-50 rounded-lg border">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Add New Tag</label>
                    <div className="flex items-center gap-2">
                         <input type="text" value={newTagInput} onChange={(e) => onNewTagInputChange(e.target.value)} placeholder="e.g., Backyard" onKeyDown={(e) => e.key === 'Enter' && onAddNewTag()} className={inputBaseClasses} />
                         <button type="button" onClick={onAddNewTag} className="px-4 py-2.5 bg-primary-light text-primary-dark font-semibold rounded-lg hover:bg-primary/20 transition-colors">Add</button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center border-t pt-6">
                <button onClick={onStartOver} className="px-6 py-3 border border-neutral-300 rounded-md shadow-sm text-md font-medium text-neutral-700 bg-white hover:bg-neutral-50">Start Over</button>
                <div className="flex items-center gap-4">
                    {mode === 'ai' && !isEditing && (
                        <button type="button" onClick={onBack} className="px-6 py-3 border border-neutral-300 rounded-md shadow-sm text-md font-medium text-neutral-700 bg-white hover:bg-neutral-50">
                            Back
                        </button>
                    )}
                    <button onClick={onNextStep} className="px-6 py-3 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-primary hover:bg-primary-dark">Next: Add Floor Plan</button>
                </div>
            </div>
        </div>
    )
};
    
const FloorplanStep: React.FC<{
    onBack: () => void;
    onFinish: () => void;
    onFloorplanChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    floorplanPreview: string | null;
    onRemoveFloorplan: () => void;
}> = ({ onBack, onFinish, onFloorplanChange, floorplanPreview, onRemoveFloorplan }) => (
     <div className="space-y-6 pt-8 animate-fade-in text-center">
        <h3 className="text-2xl font-bold text-neutral-800">Add a Floor Plan (Optional)</h3>
        <p className="text-neutral-600 mt-2 max-w-lg mx-auto">A floor plan can significantly increase buyer interest. Upload an image of your property's layout.</p>
        
        {floorplanPreview ? (
            <div className="relative inline-block group mt-4">
                <img src={floorplanPreview} alt="Floor plan preview" className="max-h-80 rounded-lg shadow-md mx-auto border" />
                <button 
                    onClick={onRemoveFloorplan}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    &times;
                </button>
            </div>
        ) : (
            <div className="mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-neutral-400" />
                    <label htmlFor="floorplan-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark">
                        <input id="floorplan-upload" name="floorplan-upload" type="file" className="sr-only" accept="image/*,.pdf" onChange={onFloorplanChange} />
                        <span>Upload floor plan</span>
                    </label>
                </div>
            </div>
        )}
        
        <div className="flex flex-row justify-center items-center gap-4 pt-6">
            <button 
                type="button"
                onClick={onBack} 
                className="px-8 py-3 border border-neutral-300 rounded-lg text-md font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors shadow-sm"
            >
                Back
            </button>
            <button 
                onClick={onFinish} 
                className="px-8 py-3 border border-transparent rounded-lg text-md font-semibold text-white bg-primary hover:bg-primary-dark transition-colors shadow-sm"
            >
                Finish Listing
            </button>
        </div>
     </div>
);
    
const SuccessStep: React.FC<{isEditing: boolean, onStartOver: () => void, onViewListings: () => void}> = ({ isEditing, onStartOver, onViewListings }) => (
    <div className="text-center py-12 flex flex-col items-center justify-center animate-fade-in">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-2xl font-bold text-neutral-800">{isEditing ? 'Listing Updated!' : 'Listing Published!'}</h3>
        <p className="text-neutral-600 mt-2 max-w-md mx-auto">
            {isEditing ? 'Your changes have been successfully saved.' : 'Your new property is now live. You can manage all your listings from your account page, or create another one.'}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
            <button onClick={onViewListings} className="w-full flex justify-center py-3 px-4 border border-primary text-primary rounded-lg shadow-sm text-md font-medium bg-white hover:bg-primary-light transition-colors">View My Listings</button>
            <button onClick={onStartOver} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-primary hover:bg-primary-dark transition-colors">Create Another Listing</button>
        </div>
    </div>
);


const GeminiDescriptionGenerator: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { propertyToEdit } = state;
    
    const [imageData, setImageData] = useState<ImageData[]>([]);
    const [floorplan, setFloorplan] = useState<File | null>(null);
    const [floorplanPreview, setFloorplanPreview] = useState<string | null>(null);
    const [step, setStep] = useState<Step>('init');
    const [mode, setMode] = useState<Mode>('ai');
    const [language, setLanguage] = useState('English');
    const [listingData, setListingData] = useState<ListingData | null>(null);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [availableTags, setAvailableTags] = useState<string[]>(INITIAL_ROOM_TAGS);
    const [newTagInput, setNewTagInput] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const availableCountries = useMemo(() => Object.keys(CITY_DATA).sort(), []);
    
    useEffect(() => {
        if (propertyToEdit) {
            setIsEditing(true);
            setListingData({
                address: propertyToEdit.address,
                city: propertyToEdit.city,
                country: propertyToEdit.country,
                price: propertyToEdit.price,
                bedrooms: propertyToEdit.beds,
                bathrooms: propertyToEdit.baths,
                sq_meters: propertyToEdit.sqft,
                year_built: propertyToEdit.yearBuilt,
                parking_spots: propertyToEdit.parking,
                specialFeatures: propertyToEdit.specialFeatures || [],
                materials: propertyToEdit.materials || [],
                description: propertyToEdit.description || '',
                tourUrl: propertyToEdit.tourUrl || '',
                propertyType: propertyToEdit.propertyType,
                image_tags: (propertyToEdit.images || []).map((img, index) => ({ index, tag: img.tag })),
            });
            const allImages = [
                { url: propertyToEdit.imageUrl, tag: 'exterior' as PropertyImageTag },
                ...(propertyToEdit.images || [])
            ].filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

            setImageData(allImages.map(img => ({ file: null, previewUrl: img.url })));

            if (propertyToEdit.floorplanUrl) {
                setFloorplanPreview(propertyToEdit.floorplanUrl);
            }
            
            setMode('manual');
            setStep('form');
            setError('');
            setFormErrors({});
        } else {
             handleStartOver();
        }
    }, [propertyToEdit]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const filesArray = Array.from(event.target.files);
            // FIX: Explicitly type 'file' as File to resolve a TypeScript type inference issue where 'file' was being treated as 'unknown'.
            const newImageData = filesArray.map((file: File) => ({ file, previewUrl: URL.createObjectURL(file) }));
            setImageData(prev => [...prev, ...newImageData]);
        }
    };

    const removeImage = (index: number) => {
        const itemToRemove = imageData[index];
        if (itemToRemove.file) { // Only revoke if it's a blob URL
            URL.revokeObjectURL(itemToRemove.previewUrl);
        }

        setImageData(prev => prev.filter((_, i) => i !== index));

        if (listingData) {
            const newTags = listingData.image_tags
                .filter(tag => tag.index !== index)
                .map(tag => ({
                    ...tag,
                    index: tag.index > index ? tag.index - 1 : tag.index
                }));
            handleDataChange('image_tags', newTags);
        }
    };
    
    const handleReorderImages = (dragIndex: number, hoverIndex: number) => {
        setImageData(prev => {
            const newImageData = [...prev];
            const [draggedItem] = newImageData.splice(dragIndex, 1);
            newImageData.splice(hoverIndex, 0, draggedItem);
            return newImageData;
        });

        if (listingData) {
            const newTags = [...listingData.image_tags];
            const dragItemTag = newTags.find(t => t.index === dragIndex);
            const hoverItemTag = newTags.find(t => t.index === hoverIndex);

            // Simple swap logic might not be enough, need to re-order the whole array
            const reorderedTags = [...listingData.image_tags];
            const [draggedTag] = reorderedTags.splice(dragIndex, 1);
            if (draggedTag) {
                reorderedTags.splice(hoverIndex, 0, draggedTag);
            }

            // After reordering, remap all indices
            const finalTags = reorderedTags.map((tag, index) => ({ ...tag, index }));

            handleDataChange('image_tags', finalTags);
        }
    };


    const handleFloorplanChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setFloorplan(file);
            if (floorplanPreview && floorplanPreview.startsWith('blob:')) {
                URL.revokeObjectURL(floorplanPreview);
            }
            const previewUrl = URL.createObjectURL(file);
            setFloorplanPreview(previewUrl);
        }
    };

    const handleRemoveFloorplan = () => {
        if (floorplanPreview && floorplanPreview.startsWith('blob:')) {
            URL.revokeObjectURL(floorplanPreview);
        }
        setFloorplan(null);
        setFloorplanPreview(null);
    };
    
    const handleGenerate = async () => {
        if (!state.isAuthenticated) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
            return;
        }

        const filesToProcess = imageData.map(d => d.file).filter((f): f is File => f !== null);

        if (filesToProcess.length === 0) {
            setError('Please upload at least one new image to use AI generation.');
            return;
        }
        setStep('loading');
        setError('');

        try {
            const analysisResult = await generateDescriptionFromImages(filesToProcess, language);
            setListingData({
                ...initialListingData,
                bedrooms: analysisResult.bedrooms,
                bathrooms: analysisResult.bathrooms,
                sq_meters: analysisResult.sq_meters,
                year_built: analysisResult.year_built,
                parking_spots: analysisResult.parking_spots,
                specialFeatures: [...(analysisResult.amenities || []), ...(analysisResult.key_features || [])],
                materials: analysisResult.materials || [],
                description: analysisResult.description,
                image_tags: analysisResult.image_tags,
                propertyType: analysisResult.property_type || 'house',
            });
            setStep('form');
        } catch (e) {
            if (e instanceof Error) setError(e.message);
            else setError('An unknown error occurred.');
            setStep('init');
        }
    };
    
    const handleStartOver = () => {
        imageData.forEach(img => {
            if (img.file) URL.revokeObjectURL(img.previewUrl);
        });
        if (floorplanPreview && floorplanPreview.startsWith('blob:')) {
            URL.revokeObjectURL(floorplanPreview);
        }

        setImageData([]);
        setFloorplan(null);
        setFloorplanPreview(null);
        setListingData(null);
        setError('');
        setFormErrors({});
        setMode('ai');
        setIsEditing(false);
        dispatch({ type: 'SET_PROPERTY_TO_EDIT', payload: null });
        setStep('init');
    };

    const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
        if (newMode === 'manual') {
            setListingData(initialListingData);
            imageData.forEach(img => { if (img.file) URL.revokeObjectURL(img.previewUrl); });
            setImageData([]);
            setError('');
            setFormErrors({});
            setStep('form');
        } else {
            handleStartOver();
        }
    };

    const handleDataChange = useCallback((field: keyof ListingData, value: any) => {
        setListingData(currentData => {
            if (!currentData) return null;
            return { ...currentData, [field]: value };
        });
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const key = name as keyof ListingData;
        
        setListingData(currentData => {
            if (!currentData) return null;
            
            let parsedValue: string | number = value;
            if (type === 'number') {
                const num = parseInt(value, 10);
                parsedValue = Math.max(0, num || 0);
            } else if (name === 'price') {
                const num = parseInt(value.replace(/\D/g, ''), 10);
                parsedValue = isNaN(num) ? 0 : num;
            }
    
            const updatedData = { ...currentData, [key]: parsedValue };
    
            if (key === 'country') {
                updatedData.city = '';
            }
    
            return updatedData;
        });
    }, []);
    
    const handleImageTagChange = useCallback((index: number, tag: string) => {
        if (!listingData) return;
        const newTags = [...listingData.image_tags];
        const existingTagIndex = newTags.findIndex(t => t.index === index);
        if (tag === '') {
            if (existingTagIndex > -1) newTags.splice(existingTagIndex, 1);
        } else {
            if (existingTagIndex > -1) newTags[existingTagIndex] = { index, tag };
            else newTags.push({ index, tag });
        }
        handleDataChange('image_tags', newTags);
    }, [listingData, handleDataChange]);

    const validateForm = useCallback((): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!listingData) {
            errors.form = "Listing data is missing. Please start over.";
            return errors;
        }

        if (!listingData.country) errors.country = 'Country is required.';
        if (!listingData.city) errors.city = 'City is required.';
        if (!listingData.address.trim()) errors.address = 'Address is required.';
        if (!listingData.price || listingData.price <= 0) errors.price = 'Price must be greater than zero.';
        
        if (!listingData.sq_meters || listingData.sq_meters <= 0) errors.sq_meters = 'Area must be greater than 0.';
        
        if (imageData.length === 0) errors.images = 'Please upload at least one property image.';

        return errors;
    }, [listingData, imageData]);

    const handleProceedToFloorplan = useCallback(() => {
        const errors = validateForm();
        setFormErrors(errors);
        if (Object.keys(errors).length === 0) {
            setStep('floorplan');
        }
    }, [validateForm]);

    const handleFinalizeListing = () => {
        if (!state.isAuthenticated || !state.currentUser) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
            return;
        }

        const errors = validateForm();
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setStep('form');
            return;
        }
        
        if (!listingData) return;

        const cityData = CITY_DATA[listingData.country]?.find(c => c.name.toLowerCase() === listingData.city.toLowerCase());

        const newImages: PropertyImage[] = imageData.map((data, index) => {
            const tagInfo = listingData.image_tags.find(t => t.index === index);
            let tag: PropertyImageTag = 'other';
            if (tagInfo && ALL_VALID_TAGS.includes(tagInfo.tag as PropertyImageTag)) {
                tag = tagInfo.tag as PropertyImageTag;
            }
            return { url: data.previewUrl, tag };
        });
        
        const newTimestamp = Date.now();
        
        if (isEditing && propertyToEdit) {
            const updatedProperty: Property = {
                ...propertyToEdit,
                price: listingData.price,
                address: listingData.address,
                city: listingData.city,
                country: listingData.country,
                beds: listingData.bedrooms,
                baths: listingData.bathrooms,
                sqft: listingData.sq_meters,
                yearBuilt: listingData.year_built,
                parking: listingData.parking_spots,
                description: listingData.description,
                specialFeatures: listingData.specialFeatures,
                materials: listingData.materials,
                tourUrl: listingData.tourUrl,
                imageUrl: imageData[0]?.previewUrl || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto-format=fit=crop',
                images: newImages.slice(1), // Exclude main image from the array as per schema
                propertyType: listingData.propertyType,
                floorplanUrl: floorplanPreview || undefined,
                createdAt: newTimestamp, // Update timestamp to show as recent
            };
            dispatch({ type: 'UPDATE_PROPERTY', payload: updatedProperty });
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
        } else {
            const sellerFromUser: Seller = {
                type: state.currentUser.role === UserRole.AGENT ? 'agent' : 'private',
                name: state.currentUser.name,
                avatarUrl: state.currentUser.avatarUrl,
                phone: state.currentUser.phone,
                agencyName: state.currentUser.agencyName,
            };

            const newProperty: Property = {
                id: Date.now().toString(),
                sellerId: state.currentUser.id,
                status: 'active',
                price: listingData.price,
                address: listingData.address,
                city: listingData.city,
                country: listingData.country,
                beds: listingData.bedrooms,
                baths: listingData.bathrooms,
                sqft: listingData.sq_meters,
                yearBuilt: listingData.year_built,
                parking: listingData.parking_spots,
                description: listingData.description,
                specialFeatures: listingData.specialFeatures,
                materials: listingData.materials,
                tourUrl: listingData.tourUrl,
                imageUrl: imageData[0]?.previewUrl || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto-format=fit=crop',
                images: newImages.slice(1),
                lat: cityData?.lat || 44.2,
                lng: cityData?.lng || 19.9,
                seller: sellerFromUser,
                propertyType: listingData.propertyType,
                floorplanUrl: floorplanPreview || undefined,
                createdAt: newTimestamp,
            };
            dispatch({ type: 'ADD_PROPERTY', payload: newProperty });
            dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: true, isOffer: true } });
            setStep('success');
        }
    };

    const handleAddNewTag = useCallback(() => {
        const trimmedTag = newTagInput.trim().toLowerCase().replace(/\s+/g, '_');
        if (trimmedTag && !availableTags.includes(trimmedTag)) {
            setAvailableTags(prev => [...prev, trimmedTag]);
            setNewTagInput('');
        }
    }, [newTagInput, availableTags]);

    const handleViewListings = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'account' });
    };

    const handleBackFromForm = () => {
        setListingData(null);
        setStep('init');
    };

    const handleBackFromFloorplan = () => {
        setStep('form');
    };
    
    const renderStep = () => {
        switch (step) {
            case 'init': 
                return <InitStep 
                    mode={mode} onModeChange={handleModeChange}
                    language={language} onLanguageChange={setLanguage}
                    onImageChange={handleImageChange} imageData={imageData} onRemoveImage={removeImage}
                    onGenerate={handleGenerate} error={error}
                />;
            case 'loading': 
                return <LoadingStep />;
            case 'form': 
                if (!listingData) return null;
                return <FormStep 
                    listingData={listingData}
                    mode={mode}
                    isEditing={isEditing}
                    onModeChange={handleModeChange}
                    formErrors={formErrors}
                    handleDataChange={handleDataChange}
                    handleInputChange={handleInputChange}
                    handleImageTagChange={handleImageTagChange}
                    imageData={imageData} onImageChange={handleImageChange} onRemoveImage={removeImage}
                    onReorderImages={handleReorderImages}
                    availableTags={availableTags} newTagInput={newTagInput} onNewTagInputChange={setNewTagInput} onAddNewTag={handleAddNewTag}
                    onStartOver={handleStartOver}
                    onNextStep={handleProceedToFloorplan}
                    onBack={handleBackFromForm}
                    availableCountries={availableCountries}
                />;
            case 'floorplan': 
                return <FloorplanStep 
                    onFinish={handleFinalizeListing} 
                    onFloorplanChange={handleFloorplanChange}
                    floorplanPreview={floorplanPreview}
                    onRemoveFloorplan={handleRemoveFloorplan}
                    onBack={handleBackFromFloorplan}
                />;
            case 'success': 
                return <SuccessStep isEditing={isEditing} onStartOver={handleStartOver} onViewListings={handleViewListings} />;
            default: 
                return <InitStep 
                    mode={mode} onModeChange={handleModeChange}
                    language={language} onLanguageChange={setLanguage}
                    onImageChange={handleImageChange} imageData={imageData} onRemoveImage={removeImage}
                    onGenerate={handleGenerate} error={error}
                />;
        }
    }
    
    return <div>{renderStep()}</div>;
};

export default GeminiDescriptionGenerator;
