import React, { useState, useMemo, useEffect } from 'react';
import { Property, PropertyImage, PropertyImageTag } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { ArrowLeftIcon, MapPinIcon, BedIcon, BathIcon, SqftIcon, CalendarIcon, ParkingIcon, PhoneIcon, StarIcon, CubeIcon, VideoCameraIcon, UserCircleIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '../../constants';

interface PropertyDetailsPageProps {
  property: Property;
}

const DetailItem: React.FC<{icon: React.ReactNode, label: string, children: React.ReactNode}> = ({ icon, label, children }) => (
    <div>
        <div className="flex items-center mb-2">
            <div className="flex-shrink-0 w-6 h-6 mr-3 text-primary">{icon}</div>
            <h3 className="text-lg font-semibold text-neutral-800">{label}</h3>
        </div>
        <div className="pl-9 text-neutral-700">
            {children}
        </div>
    </div>
);

const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ property }) => {
  const { dispatch } = useAppContext();
  
  const allImages: PropertyImage[] = useMemo(() => [
      { url: property.imageUrl, tag: 'exterior' as PropertyImageTag },
      ...property.images,
  ].filter((v,i,a)=>a.findIndex(t=>(t.url === v.url))===i), [property.imageUrl, property.images]); // Unique images

  const [mainImage, setMainImage] = useState<PropertyImage>(allImages[0]);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<PropertyImageTag | 'all'>('all');
  const [currentZoomIndex, setCurrentZoomIndex] = useState(0);

  const uniqueTags = useMemo(() => ['all' as const, ...Array.from(new Set(allImages.map(img => img.tag)))], [allImages]);
  
  const filteredImages = useMemo(() => {
    if (activeTag === 'all') return allImages;
    return allImages.filter(img => img.tag === activeTag);
  }, [allImages, activeTag]);

  useEffect(() => {
    if (filteredImages.length > 0 && !filteredImages.some(img => img.url === mainImage.url)) {
        setMainImage(filteredImages[0]);
    } else if (filteredImages.length === 0 && allImages.length > 0) {
        setMainImage(allImages[0]);
    }
  }, [filteredImages, allImages, mainImage.url]);

  const handleBackClick = () => {
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
  };

  const handleTagClick = (tag: PropertyImageTag | 'all') => {
    setActiveTag(tag);
  };
  
  const handleZoomOpen = (image: PropertyImage) => {
    const index = filteredImages.findIndex(img => img.url === image.url);
    setCurrentZoomIndex(index >= 0 ? index : 0);
    setIsZoomModalOpen(true);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentZoomIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentZoomIndex(prev => (prev < filteredImages.length - 1 ? prev + 1 : prev));
  };
  
  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="p-4 bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b">
          <button onClick={handleBackClick} className="flex items-center gap-2 text-neutral-700 font-semibold hover:text-primary transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Search
          </button>
        </div>

        <main className="p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <button onClick={() => handleZoomOpen(mainImage)} className="w-full h-[300px] md:h-[500px] rounded-lg overflow-hidden shadow-lg block relative group">
                            <img src={mainImage.url} alt={mainImage.tag} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>
                            </div>
                        </button>
                        
                        <div className="flex flex-wrap gap-2">
                            {uniqueTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${activeTag === tag ? 'bg-primary text-white' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'}`}
                                >
                                    {tag === 'all' ? 'All Photos' : tag.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>

                        <div className="flex overflow-x-auto space-x-3 pb-2 -mx-1 px-1">
                            {filteredImages.map((image, index) => (
                                <button 
                                    key={`${image.url}-${index}`}
                                    onClick={() => setMainImage(image)} 
                                    className={`flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden shadow-md transition-all ${mainImage.url === image.url ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-2 hover:ring-primary/50'}`}
                                >
                                    <img src={image.url} alt={image.tag} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Key Stats Bar */}
                    <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4">
                            <div className="text-center px-2">
                                <BedIcon className="w-7 h-7 text-primary mx-auto" />
                                <p className="text-sm font-semibold text-neutral-700 mt-2"><span className="font-bold text-lg">{property.beds}</span> Beds</p>
                            </div>
                            <div className="text-center px-2">
                                <BathIcon className="w-7 h-7 text-primary mx-auto" />
                                <p className="text-sm font-semibold text-neutral-700 mt-2"><span className="font-bold text-lg">{property.baths}</span> Baths</p>
                            </div>
                            <div className="text-center px-2">
                                <SqftIcon className="w-7 h-7 text-primary mx-auto" />
                                <p className="text-sm font-semibold text-neutral-700 mt-2"><span className="font-bold text-lg">{property.sqft}</span> m²</p>
                            </div>
                            <div className="text-center px-2">
                                <ParkingIcon className="w-7 h-7 text-primary mx-auto" />
                                <p className="text-sm font-semibold text-neutral-700 mt-2"><span className="font-bold text-lg">{property.parking}</span> Parking</p>
                            </div>
                        </div>
                    </div>

                    {/* About this property */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
                        <h2 className="text-2xl font-bold text-neutral-800 mb-4">About this property</h2>
                        <div className="prose max-w-none text-neutral-700 whitespace-pre-wrap">{property.description}</div>
                    </div>
                </div>

                {/* Right Column - Sticky Sidebar */}
                <div className="lg:col-span-1 self-start sticky top-24">
                     <div className="space-y-8">
                        {/* Price & Location Card */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
                             <p className="text-4xl font-extrabold text-primary">{formatPrice(property.price, property.country)}</p>
                             <div className="flex items-center text-neutral-600 mt-2">
                                <MapPinIcon className="w-5 h-5 mr-1.5 text-neutral-400 flex-shrink-0" />
                                <span className="text-lg font-semibold">{property.address}, {property.city}</span>
                            </div>
                        </div>

                        {/* Seller Card */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
                            <h3 className="text-xl font-bold text-neutral-800 mb-4">Contact Seller</h3>
                            {property.seller.type === 'agent' ? (
                                <div className="flex items-center gap-4">
                                    <img src={property.seller.avatarUrl} alt={property.seller.name} className="w-16 h-16 rounded-full object-cover" />
                                    <div>
                                        <p className="font-semibold text-neutral-900">{property.seller.name}</p>
                                        <div className="flex items-center text-sm text-neutral-600 mt-1">
                                            <PhoneIcon className="w-4 h-4 mr-1.5 text-neutral-400" />
                                            <span>{property.seller.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <UserCircleIcon className="w-16 h-16 text-neutral-300 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-neutral-900">{property.seller.name}</p>
                                        <p className="text-xs font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full inline-block mt-1">Private Seller</p>
                                    </div>
                                </div>
                            )}
                             <button className="w-full mt-6 bg-secondary text-white py-2.5 rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-sm">
                                Message Seller
                            </button>
                        </div>
                        
                         {/* Property Details Card */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
                            <div className="space-y-6">
                               <DetailItem icon={<CalendarIcon/>} label="Property Details">
                                    <p className="font-semibold">Built in {property.yearBuilt}</p>
                               </DetailItem>
                               <DetailItem icon={<StarIcon/>} label="Special Features">
                                    <ul className="list-disc list-inside space-y-1 font-semibold">
                                        {property.specialFeatures.map((feature, i) => <li key={i}>{feature}</li>)}
                                    </ul>
                               </DetailItem>
                                <DetailItem icon={<CubeIcon/>} label="Materials">
                                    <ul className="list-disc list-inside space-y-1 font-semibold">
                                        {property.materials.map((material, i) => <li key={i}>{material}</li>)}
                                    </ul>
                               </DetailItem>
                            </div>
                        </div>

                        {/* 3D Tour */}
                        {property.tourUrl && (
                            <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
                                <h3 className="text-xl font-bold text-neutral-800 mb-4">Virtual Tour</h3>
                                <p className="text-neutral-600 text-sm mb-4">Explore this property from every angle with our immersive 3D tour.</p>
                                 <a href={property.tourUrl} target="_blank" rel="noopener noreferrer" className="w-full flex justify-center items-center gap-2 bg-neutral-800 text-white py-2.5 rounded-lg font-bold hover:bg-neutral-900 transition-colors shadow-sm">
                                    <VideoCameraIcon className="w-5 h-5"/>
                                    Launch 3D Tour
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
      </div>

      {isZoomModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 animate-fade-in" onClick={() => setIsZoomModalOpen(false)}>
            <button className="absolute top-4 right-4 text-white hover:text-neutral-300 z-50">
                <XMarkIcon className="w-8 h-8" />
            </button>
            <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                <div className="relative w-full max-w-5xl h-4/5 flex items-center justify-center">
                    <button
                        onClick={handlePrevImage}
                        disabled={currentZoomIndex === 0}
                        className="absolute left-0 sm:-left-4 md:-left-12 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-3 text-white z-50 transition-colors"
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    
                    {filteredImages.length > 0 && (
                        <img src={filteredImages[currentZoomIndex].url} alt={filteredImages[currentZoomIndex].tag} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                    )}

                    <button
                        onClick={handleNextImage}
                        disabled={currentZoomIndex === filteredImages.length - 1}
                        className="absolute right-0 sm:-right-4 md:-right-12 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-3 text-white z-50 transition-colors"
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="w-full max-w-5xl mt-4 h-1/5 flex items-center justify-center">
                    <div className="flex overflow-x-auto space-x-4 p-2">
                        {filteredImages.map((image, index) => (
                            <button
                                key={`${image.url}-${index}-modal`}
                                onClick={(e) => { e.stopPropagation(); setCurrentZoomIndex(index); }}
                                className={`flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 ${currentZoomIndex === index ? 'ring-4 ring-white shadow-2xl' : 'opacity-60 hover:opacity-100'}`}
                            >
                                <img src={image.url} alt={image.tag} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;
