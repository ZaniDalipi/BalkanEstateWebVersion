import React, { useState, useMemo, useEffect } from 'react';
import { Property, PropertyImage, PropertyImageTag } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { 
    ArrowLeftIcon, MapPinIcon, BedIcon, BathIcon, SqftIcon, CalendarIcon, 
    ParkingIcon, PhoneIcon, StarIcon, CubeIcon, VideoCameraIcon, UserCircleIcon, 
    XMarkIcon, ChevronLeftIcon, ChevronRightIcon, SparklesIcon 
} from '../../constants';
import { getNeighborhoodInsights } from '../../services/geminiService';

// --- NeighborhoodInsights Component Logic (Inlined) ---
interface NeighborhoodInsightsProps {
    lat: number;
    lng: number;
    city: string;
    country: string;
}

const parseMarkdown = (text: string) => {
    // A simple parser to handle paragraphs, bold, and unordered lists
    const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const lines = sanitizedText.split('\n').filter(line => line.trim() !== '');
    // FIX: Changed `JSX.Element[]` to `React.ReactElement[]` to resolve `Cannot find namespace 'JSX'` error.
    const elements: React.ReactElement[] = [];
    let listItems: string[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="space-y-2 pl-1">
                    {listItems.map((item, i) => (
                        <li key={i} className="flex items-start">
                           <span className="mr-3 mt-1 text-primary">&#8226;</span>
                           <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </li>
                    ))}
                </ul>
            );
            listItems = [];
        }
    };

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('* ')) {
            listItems.push(trimmedLine.substring(2).trim());
        } else {
            flushList();
            elements.push(<p key={`p-${elements.length}`} dangerouslySetInnerHTML={{ __html: trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />);
        }
    }
    flushList();
    return elements;
};

const NeighborhoodInsights: React.FC<NeighborhoodInsightsProps> = ({ lat, lng, city, country }) => {
    const [insights, setInsights] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true); setError(null);
                const result = await getNeighborhoodInsights(lat, lng, city, country);
                setInsights(result);
            } catch (err) {
                if (err instanceof Error) setError(err.message);
                else setError('An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, [lat, lng, city, country]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="p-6 bg-primary-light/50 rounded-lg animate-pulse">
                    <div className="h-4 bg-primary/20 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-primary/20 rounded w-full mb-2"></div>
                    <div className="h-3 bg-primary/20 rounded w-full mb-2"></div>
                    <div className="h-3 bg-primary/20 rounded w-5/6"></div>
                </div>
            );
        }
        if (error) {
            return (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <p><strong>Could not load neighborhood insights.</strong> Please try again later.</p>
                </div>
            );
        }
        if (insights) {
            return (
                <div className="prose prose-sm max-w-none text-neutral-700 space-y-3">
                    {parseMarkdown(insights)}
                </div>
            );
        }
        return null;
    }

    return (
        <div>
            <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-8 h-8 mr-3 text-primary bg-primary-light rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800">Neighborhood Insights</h3>
            </div>
            {renderContent()}
        </div>
    );
};

// --- Main Page Component ---
interface PropertyDetailsPageProps {
  property: Property;
}

const DetailItem: React.FC<{icon: React.ReactNode, label: string, children: React.ReactNode}> = ({ icon, label, children }) => (
    <div>
        <div className="flex items-center mb-2">
            <div className="flex-shrink-0 w-6 h-6 mr-3 text-primary">{icon}</div>
            <h3 className="text-lg font-semibold text-neutral-800">{label}</h3>
        </div>
        <div className="pl-9 text-neutral-600">
            {children}
        </div>
    </div>
);

const ImageGallery: React.FC<{images: PropertyImage[], tourUrl?: string}> = ({ images, tourUrl }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const sortedImages = useMemo(() => {
        const preferredOrder: PropertyImageTag[] = ['exterior', 'living_room', 'kitchen', 'bedroom', 'bathroom', 'other'];
        return [...images].sort((a, b) => preferredOrder.indexOf(a.tag) - preferredOrder.indexOf(b.tag));
    }, [images]);

    if (!images || images.length === 0) return null;

    return (
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden group shadow-lg">
            <div
                style={{ backgroundImage: `url(${sortedImages[currentIndex].url})` }}
                className="w-full h-full bg-center bg-cover duration-500"
            ></div>
            {images.length > 1 && (
                <>
                    <div className="hidden group-hover:flex absolute top-[50%] -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer" onClick={prevSlide}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </div>
                    <div className="hidden group-hover:flex absolute top-[50%] -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer" onClick={nextSlide}>
                        <ChevronRightIcon className="w-6 h-6" />
                    </div>
                </>
            )}
             {tourUrl && (
                <a href={tourUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary-dark transition-colors">
                    <VideoCameraIcon className="w-5 h-5" />
                    <span>3D Tour</span>
                </a>
            )}
        </div>
    );
};

const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ property }) => {
  const { state, dispatch } = useAppContext();

  const handleBack = () => {
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
  };

  const handleFavoriteClick = () => {
      if (!state.isAuthenticated) {
          dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
      } else {
          dispatch({ type: 'TOGGLE_SAVED_HOME', payload: property });
      }
  };

  const isFavorited = state.savedHomes.some(p => p.id === property.id);

  return (
    <div className="absolute inset-0 bg-white z-30 overflow-y-auto animate-fade-in">
        <div className="p-4 bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10 flex items-center justify-between">
            <button onClick={handleBack} className="flex items-center gap-2 text-primary font-semibold hover:underline">
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Search
            </button>
            <div onClick={handleFavoriteClick} className="bg-white p-2 rounded-full cursor-pointer border border-neutral-200 hover:shadow-md">
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors duration-300 ${isFavorited ? 'text-red-500 fill-current' : 'text-neutral-500 hover:text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </div>
        </div>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        
        <ImageGallery images={property.images} tourUrl={property.tourUrl} />
        
        <div className="mt-8">
            <p className="text-4xl font-bold text-neutral-900">{formatPrice(property.price, property.country)}</p>
            <div className="flex items-center text-neutral-600 mt-2">
                <MapPinIcon className="w-5 h-5 mr-2 text-neutral-400" />
                <span className="text-lg">{property.address}, {property.city}, {property.country}</span>
            </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-around text-lg text-neutral-800 border-y border-neutral-200 py-4 gap-4">
          <div className="flex items-center gap-3"><BedIcon className="w-6 h-6 text-primary" /><span><span className="font-bold">{property.beds}</span> beds</span></div>
          <div className="flex items-center gap-3"><BathIcon className="w-6 h-6 text-primary" /><span><span className="font-bold">{property.baths}</span> baths</span></div>
          <div className="flex items-center gap-3"><SqftIcon className="w-6 h-6 text-primary" /><span><span className="font-bold">{property.sqft}</span> m²</span></div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-4">About This Home</h3>
                    <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap">
                        {property.description}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <DetailItem icon={<CalendarIcon />} label="Year Built">
                        {property.yearBuilt}
                    </DetailItem>
                    <DetailItem icon={<ParkingIcon />} label="Parking">
                        {property.parking > 0 ? `${property.parking} ${property.parking === 1 ? 'spot' : 'spots'}` : 'None'}
                    </DetailItem>
                    <div className="col-span-2">
                        <DetailItem icon={<StarIcon />} label="Special Features">
                            {property.specialFeatures.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {property.specialFeatures.map(feature => <li key={feature}>{feature}</li>)}
                                </ul>
                            ) : 'Not listed'}
                        </DetailItem>
                    </div>
                    <div className="col-span-2">
                         <DetailItem icon={<CubeIcon />} label="Materials">
                             {property.materials.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {property.materials.map(material => <li key={material}>{material}</li>)}
                                </ul>
                            ) : 'Not listed'}
                        </DetailItem>
                    </div>
                </div>

                <NeighborhoodInsights 
                    lat={property.lat} 
                    lng={property.lng} 
                    city={property.city} 
                    country={property.country} 
                />

            </div>
            <div className="md:col-span-1">
                <div className="sticky top-24 bg-white p-6 rounded-lg shadow-lg border border-neutral-200">
                    <h3 className="text-xl font-bold text-neutral-800 mb-4">Contact Seller</h3>
                    <div className="flex items-center gap-4 mb-6">
                        {property.seller.avatarUrl ? (
                            <img src={property.seller.avatarUrl} alt={property.seller.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                            <UserCircleIcon className="w-16 h-16 text-neutral-300" />
                        )}
                        <div>
                            <p className="font-bold text-lg text-neutral-900">{property.seller.name}</p>
                            <p className="text-sm text-neutral-600 capitalize">{property.seller.type}</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <a href={`tel:${property.seller.phone}`} className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-primary hover:bg-primary-dark">
                            <PhoneIcon className="w-5 h-5" />
                            Call Seller
                        </a>
                         <button className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-primary text-primary rounded-lg shadow-sm text-md font-medium bg-white hover:bg-primary-light">
                            Request Info
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PropertyDetailsPage;