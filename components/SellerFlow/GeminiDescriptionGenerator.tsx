// FIX: Removed extraneous content from another file that was incorrectly appended, which was causing multiple import and export errors.
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Property, PropertyImage, PropertyImageTag } from '../../types';
import { generateDescriptionFromImages, PropertyAnalysisResult } from '../../services/geminiService';
import { sellers, CITY_DATA } from '../../services/propertyService';
import { SparklesIcon } from '../../constants';
import { COUNTRIES, getCurrencySymbol } from '../../utils/currency';
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
const floatingInputClasses = "block px-2.5 pb-2.5 pt-4 w-full text-base text-neutral-900 bg-white rounded-lg border border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer";
const floatingLabelClasses = "absolute text-base text-neutral-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1";
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
    imagePreviews: string[], onRemoveImage: (index: number) => void,
    onGenerate: () => void, imagesCount: number, error: string,
}> = ({ mode, onModeChange, language, onLanguageChange, onImageChange, imagePreviews, onRemoveImage, onGenerate, imagesCount, error }) => (
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
             <select id="language-select" value={language} onChange={(e) => onLanguageChange(e.target.value)} className={floatingInputClasses}>
                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
             </select>
             <label htmlFor="language-select" className={`${floatingSelectLabelClasses} flex items-center gap-1.5`}>
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

        {imagePreviews.length > 0 && (
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                        <img src={preview} alt={`preview ${index}`} className="h-24 w-24 object-cover rounded-md shadow-sm" />
                        <button onClick={() => onRemoveImage(index)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs leading-none transform -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                    </div>
                ))}
            </div>
        )}
        
        <button onClick={onGenerate} disabled={imagesCount === 0} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-primary hover:bg-primary-dark disabled:bg-opacity-50 disabled:cursor-not-allowed">Generate with AI</button>
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
    onModeChange: (mode: Mode) => void;
    handleDataChange: (field: keyof ListingData, value: any) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleImageTagChange: (index: number, tag: string) => void;
    imagePreviews: string[];
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    availableTags: string[];
    newTagInput: string;
    onNewTagInputChange: (value: string) => void;
    onAddNewTag: () => void;
    onStartOver: () => void;
    onNextStep: () => void;
}> = ({ listingData, mode, onModeChange, handleDataChange, handleInputChange, handleImageTagChange, imagePreviews, onImageChange, availableTags, newTagInput, onNewTagInputChange, onAddNewTag, onStartOver, onNextStep }) => {

    const onChipItemsChange = useCallback((items: string[]) => handleDataChange('specialFeatures', items), [handleDataChange]);
    const onMaterialsChange = useCallback((items: string[]) => handleDataChange('materials', items), [handleDataChange]);

    const citiesForSelectedCountry = useMemo(() => {
        if (!listingData.country || !CITY_DATA[listingData.country]) {
            return [];
        }
        return CITY_DATA[listingData.country].map(c => c.name);
    }, [listingData.country]);

    return (
        <div className="space-y-8 animate-fade-in">
            <ModeToggle mode={mode} onModeChange={onModeChange} />
            {mode === 'ai' && <p className="text-center text-neutral-600 -mt-4 mb-4">The AI has generated the details below. Review and edit as needed.</p>}

            <fieldset className="space-y-4 rounded-lg border p-6">
                <legend className="text-lg font-semibold px-2 text-neutral-800">Location & Price</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pt-4">
                    <div className="relative">
                         <select id="country" name="country" value={listingData.country} onChange={handleInputChange} className={`${floatingInputClasses} peer`} required>
                            <option value="" disabled>Select a country</option>
                           {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <label htmlFor="country" className={floatingSelectLabelClasses}>Country</label>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                     <div className="relative">
                        <select id="city" name="city" value={listingData.city} onChange={handleInputChange} className={`${floatingInputClasses} peer`} required disabled={!listingData.country}>
                            <option value="" disabled>Select a city</option>
                            {citiesForSelectedCountry.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <label htmlFor="city" className={floatingSelectLabelClasses}>City</label>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>

                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                            <span className="text-neutral-500">{getCurrencySymbol(listingData.country)}</span>
                        </div>
                        <input type="text" id="price" name="price" value={listingData.price > 0 ? listingData.price.toLocaleString('de-DE') : ''} onChange={handleInputChange} placeholder=" " className={`${floatingInputClasses} pl-12 peer`} />
                        <label htmlFor="price" className={`${floatingLabelClasses}`}>Price</label>
                    </div>
                    <div className="md:col-span-2 relative">
                        <input id="address" name="address" value={listingData.address} onChange={handleInputChange} className={`${floatingInputClasses} peer`} placeholder=" "/>
                        <label htmlFor="address" className={floatingLabelClasses}>Address</label>
                    </div>
                    <div className="md:col-span-2 relative">
                        <input type="text" id="tourUrl" name="tourUrl" value={listingData.tourUrl} onChange={handleInputChange} className={`${floatingInputClasses} peer`} placeholder=" " />
                         <label htmlFor="tourUrl" className={floatingLabelClasses}>3D Tour URL (Optional)</label>
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-4 rounded-lg border p-6">
                 <legend className="text-lg font-semibold px-2 text-neutral-800">Property Details</legend>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-8 pt-4">
                    <div><label htmlFor="bedrooms" className="block text-sm font-medium text-neutral-700 mb-1">Bedrooms</label><input type="number" id="bedrooms" name="bedrooms" value={listingData.bedrooms} onChange={handleInputChange} className={inputBaseClasses} /></div>
                    <div><label htmlFor="bathrooms" className="block text-sm font-medium text-neutral-700 mb-1">Bathrooms</label><input type="number" id="bathrooms" name="bathrooms" value={listingData.bathrooms} onChange={handleInputChange} className={inputBaseClasses} /></div>
                    <div><label htmlFor="sq_meters" className="block text-sm font-medium text-neutral-700 mb-1">Area (m²)</label><input type="number" id="sq_meters" name="sq_meters" value={listingData.sq_meters} onChange={handleInputChange} className={inputBaseClasses} /></div>
                    <div><label htmlFor="year_built" className="block text-sm font-medium text-neutral-700 mb-1">Year Built</label><input type="number" id="year_built" name="year_built" value={listingData.year_built} onChange={handleInputChange} className={inputBaseClasses} /></div>
                    <div><label htmlFor="parking_spots" className="block text-sm font-medium text-neutral-700 mb-1">Parking</label><input type="number" id="parking_spots" name="parking_spots" value={listingData.parking_spots} onChange={handleInputChange} className={inputBaseClasses} /></div>
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
                <textarea id="description" name="description" rows={6} value={listingData.description} onChange={handleInputChange} className={inputBaseClasses} />
            </div>
            
            <div>
                <h4 className="font-semibold text-neutral-700 mb-2">Property Images & Tags</h4>
                <div className="mt-1 mb-4 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
                     <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-neutral-400" />
                        <label htmlFor="file-upload-form" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark"><input id="file-upload-form" name="file-upload-form" type="file" className="sr-only" multiple accept="image/*" onChange={onImageChange} /><span>Upload more images</span></label>
                    </div>
                </div>
                {imagePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={preview} className="relative group">
                                <img src={preview} alt={`preview ${index}`} className="h-32 w-full object-cover rounded-md shadow-sm border" />
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

            <div className="flex justify-end gap-4 border-t pt-6">
                 <button onClick={onStartOver} className="px-6 py-3 border border-neutral-300 rounded-md shadow-sm text-md font-medium text-neutral-700 bg-white hover:bg-neutral-50">Start Over</button>
                <button onClick={onNextStep} className="px-6 py-3 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-primary hover:bg-primary-dark">Next: Add Floor Plan</button>
            </div>
        </div>
    )
};
    
const FloorplanStep: React.FC<{
    onFinish: () => void;
    onFloorplanChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    floorplanPreview: string | null;
    onRemoveFloorplan: () => void;
}> = ({ onFinish, onFloorplanChange, floorplanPreview, onRemoveFloorplan }) => (
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
        
        <div className="flex justify-center gap-4 pt-6">
            <button onClick={onFinish} className="px-6 py-3 border border-neutral-300 rounded-md text-neutral-700 bg-white hover:bg-neutral-50">Skip & Finish</button>
            <button onClick={onFinish} className="px-6 py-3 text-white bg-primary hover:bg-primary-dark rounded-md">Finish Listing</button>
        </div>
     </div>
);
    
const SuccessStep: React.FC<{onStartOver: () => void}> = ({onStartOver}) => (
     <div className="text-center py-12 flex flex-col items-center justify-center animate-fade-in">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-2xl font-bold text-neutral-800">Listing Ready!</h3>
        <p className="text-neutral-600 mt-2 max-w-md">Your listing information has been saved and is now live for buyers to see.</p>
        <button onClick={onStartOver} className="mt-8 w-full max-w-xs flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-primary hover:bg-primary-dark">Create Another Listing</button>
    </div>
);


const GeminiDescriptionGenerator: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [floorplan, setFloorplan] = useState<File | null>(null);
    const [floorplanPreview, setFloorplanPreview] = useState<string | null>(null);
    const [step, setStep] = useState<Step>('init');
    const [mode, setMode] = useState<Mode>('ai');
    const [language, setLanguage] = useState('English');
    const [listingData, setListingData] = useState<ListingData | null>(null);
    const [error, setError] = useState('');
    const [availableTags, setAvailableTags] = useState<string[]>(INITIAL_ROOM_TAGS);
    const [newTagInput, setNewTagInput] = useState('');

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const filesArray = Array.from(event.target.files);
            setImages(prev => [...prev, ...filesArray]);
            const newPreviews = filesArray.map((file: File) => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            const newPreviews = prev.filter((_, i) => i !== index);
            URL.revokeObjectURL(prev[index]);
            return newPreviews;
        });
    };

    const handleFloorplanChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setFloorplan(file);
            if (floorplanPreview) {
                URL.revokeObjectURL(floorplanPreview);
            }
            const previewUrl = URL.createObjectURL(file);
            setFloorplanPreview(previewUrl);
        }
    };

    const handleRemoveFloorplan = () => {
        if (floorplanPreview) {
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

        if (images.length === 0) {
            setError('Please upload at least one image of your property.');
            return;
        }
        setStep('loading');
        setError('');

        try {
            const analysisResult = await generateDescriptionFromImages(images, language);
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
    
    const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
        if (newMode === 'manual') {
            if (!listingData) {
                setListingData(initialListingData);
            }
            setStep('form');
        } else {
            setStep('init');
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
                parsedValue = parseInt(value, 10) || 0;
            } else if (name === 'price') {
                parsedValue = parseInt(value.replace(/\D/g, '')) || 0;
            }
    
            const updatedData = { ...currentData, [key]: parsedValue };
    
            if (key === 'country') {
                updatedData.city = ''; // Reset city when country changes
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

    const handleFinalizeListing = () => {
        if (!listingData) return;

        const cityData = CITY_DATA[listingData.country]?.find(c => c.name.toLowerCase() === listingData.city.toLowerCase());

        const newImages: PropertyImage[] = imagePreviews.map((url, index) => {
            const tagInfo = listingData.image_tags.find(t => t.index === index);
            let tag: PropertyImageTag = 'other';
            if (tagInfo && ALL_VALID_TAGS.includes(tagInfo.tag as PropertyImageTag)) {
                tag = tagInfo.tag as PropertyImageTag;
            }
            return { url, tag };
        });
        
        const sellerKeys = Object.keys(sellers);
        const randomSellerKey = sellerKeys[Math.floor(Math.random() * sellerKeys.length)];

        const newProperty: Property = {
            id: Date.now().toString(),
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
            imageUrl: imagePreviews[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop',
            images: newImages,
            lat: cityData?.lat || 44.2, // Default fallback
            lng: cityData?.lng || 19.9, // Default fallback
            seller: sellers[randomSellerKey],
            propertyType: listingData.propertyType,
            floorplanUrl: floorplanPreview || undefined,
        };
        
        dispatch({ type: 'ADD_PROPERTY', payload: newProperty });
        setStep('success');
        dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: true, isOffer: true } });
    };
    
    const handleStartOver = () => {
        setImages([]);
        imagePreviews.forEach(URL.revokeObjectURL);
        setImagePreviews([]);
        if (floorplanPreview) {
            URL.revokeObjectURL(floorplanPreview);
        }
        setFloorplan(null);
        setFloorplanPreview(null);
        setListingData(null);
        setError('');
        setMode('ai');
        setStep('init');
    };

    const handleAddNewTag = useCallback(() => {
        const trimmedTag = newTagInput.trim().toLowerCase().replace(/\s+/g, '_');
        if (trimmedTag && !availableTags.includes(trimmedTag)) {
            setAvailableTags(prev => [...prev, trimmedTag]);
            setNewTagInput('');
        }
    }, [newTagInput, availableTags]);
    
    const renderStep = () => {
        switch (step) {
            case 'init': 
                return <InitStep 
                    mode={mode} onModeChange={handleModeChange}
                    language={language} onLanguageChange={setLanguage}
                    onImageChange={handleImageChange} imagePreviews={imagePreviews} onRemoveImage={removeImage}
                    onGenerate={handleGenerate} imagesCount={images.length} error={error}
                />;
            case 'loading': 
                return <LoadingStep />;
            case 'form': 
                if (!listingData) return null;
                return <FormStep 
                    listingData={listingData}
                    mode={mode} onModeChange={handleModeChange}
                    handleDataChange={handleDataChange}
                    handleInputChange={handleInputChange}
                    handleImageTagChange={handleImageTagChange}
                    imagePreviews={imagePreviews} onImageChange={handleImageChange}
                    availableTags={availableTags} newTagInput={newTagInput} onNewTagInputChange={setNewTagInput} onAddNewTag={handleAddNewTag}
                    onStartOver={handleStartOver}
                    onNextStep={() => setStep('floorplan')}
                />;
            case 'floorplan': 
                return <FloorplanStep 
                    onFinish={handleFinalizeListing} 
                    onFloorplanChange={handleFloorplanChange}
                    floorplanPreview={floorplanPreview}
                    onRemoveFloorplan={handleRemoveFloorplan}
                />;
            case 'success': 
                return <SuccessStep onStartOver={handleStartOver} />;
            default: 
                return <InitStep 
                    mode={mode} onModeChange={handleModeChange}
                    language={language} onLanguageChange={setLanguage}
                    onImageChange={handleImageChange} imagePreviews={imagePreviews} onRemoveImage={removeImage}
                    onGenerate={handleGenerate} imagesCount={images.length} error={error}
                />;
        }
    }
    
    return <div>{renderStep()}</div>;
};

export default GeminiDescriptionGenerator;