import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Property, PropertyImageTag, Message } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import {
    ArrowLeftIcon, MapPinIcon, BedIcon, BathIcon, SqftIcon, CalendarIcon,
    ParkingIcon, PhoneIcon, StarIcon, CubeIcon, VideoCameraIcon, UserCircleIcon,
    SparklesIcon, ChevronLeftIcon, ChevronRightIcon,
    MagnifyingGlassPlusIcon, PencilIcon, ShareIcon, ArrowDownTrayIcon, XMarkIcon,
    ArrowUturnLeftIcon,
    BuildingOfficeIcon,
    CubeTransparentIcon,
    LivingRoomIcon,
    TwitterIcon,
    WhatsappIcon,
    EnvelopeIcon,
    FacebookIcon,
    StreetViewIcon,
    CheckCircleIcon,
} from '../../constants';
import { createConversation, sendMessage, uploadMessageImage } from '../../services/apiService';
import ImageViewerModal from './ImageViewerModal';
import FloorPlanViewerModal from './FloorPlanViewerModal';
import PropertyLocationMap from './PropertyLocationMap';
import MortgageCalculator from './MortgageCalculator';
import RentVsBuyCalculator from './RentVsBuyCalculator';


// --- Image Editor Modal ---
type Point = { x: number; y: number };
type Path = { points: Point[]; color: string; lineWidth: number };

const ImageEditorModal: React.FC<{
    imageUrl: string;
    property: Property;
    onClose: () => void;
}> = ({ imageUrl, property, onClose }) => {
    const { dispatch, state } = useAppContext();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(new Image());
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [paths, setPaths] = useState<Path[]>([]);
    const [currentPath, setCurrentPath] = useState<Path | null>(null);
    const [color, setColor] = useState('#FF0000'); // Red
    const [lineWidth, setLineWidth] = useState(5);
    const [showToast, setShowToast] = useState(false);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;
        if (!canvas || !ctx || !img.src) return;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(zoom, zoom);
        ctx.drawImage(img, 0, 0);

        [...paths, currentPath].forEach(path => {
            if (!path) return;
            ctx.beginPath();
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            path.points.forEach((point, index) => {
                if (index === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        });

        ctx.restore();
    }, [zoom, offset, paths, currentPath]);
    
    useEffect(() => {
        const img = imageRef.current;
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                // Fit image to canvas initially
                const canvasAspect = canvas.clientWidth / canvas.clientHeight;
                const imgAspect = img.width / img.height;
                const initialZoom = canvasAspect > imgAspect 
                    ? canvas.clientHeight / img.height
                    : canvas.clientWidth / img.width;
                setZoom(initialZoom);
                setOffset({
                    x: (canvas.clientWidth - img.width * initialZoom) / 2,
                    y: (canvas.clientHeight - img.height * initialZoom) / 2,
                });
            }
        };
    }, [imageUrl]);

    useEffect(() => {
        draw();
    }, [draw, paths, currentPath]);

    const getMousePos = (e: React.MouseEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - offset.x) / zoom,
            y: (e.clientY - rect.top - offset.y) / zoom,
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsDrawing(true);
        const pos = getMousePos(e);
        setCurrentPath({ points: [pos], color, lineWidth });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !currentPath) return;
        const pos = getMousePos(e);
        setCurrentPath(prev => prev ? { ...prev, points: [...prev.points, pos] } : null);
    };

    const handleMouseUp = () => {
        if (isDrawing && currentPath) {
            setPaths(prev => [...prev, currentPath]);
        }
        setIsDrawing(false);
        setCurrentPath(null);
    };
    
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const scaleAmount = e.deltaY > 0 ? 0.9 : 1.1;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newZoom = Math.max(0.1, Math.min(10, zoom * scaleAmount));
        const newOffsetX = mouseX - (mouseX - offset.x) * (newZoom / zoom);
        const newOffsetY = mouseY - (mouseY - offset.y) * (newZoom / zoom);
        
        setZoom(newZoom);
        setOffset({ x: newOffsetX, y: newOffsetY });
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `annotated-${property.address.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handleShare = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            setShowToast(true);

            // Convert canvas to blob
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                }, 'image/jpeg', 0.8);
            });

            // Create a File from the blob
            const file = new File([blob], `annotated-${property.address.replace(/\s+/g, '-')}.jpg`, { type: 'image/jpeg' });

            // Get or create conversation with the seller
            let conversation = state.conversations?.find((c: any) => c.propertyId === property.id);

            if (!conversation) {
                // Create new conversation
                const newConv = await createConversation(property.id);
                conversation = newConv;
                dispatch({ type: 'CREATE_CONVERSATION', payload: newConv });
            }

            // Upload the annotated image
            const imageUrl = await uploadMessageImage(conversation.id, file);

            // Send message with the uploaded image
            const newMessage: Message = {
                id: `msg-${Date.now()}`,
                senderId: 'user',
                imageUrl: imageUrl,
                text: 'I have some questions about this property (annotated image)',
                timestamp: Date.now(),
                isRead: false,
            };

            await sendMessage(conversation.id, newMessage);

            // Update local state
            dispatch({ type: 'ADD_MESSAGE', payload: { conversationId: conversation.id, message: newMessage }});

            // Navigate to inbox to show the sent message
            setTimeout(() => {
                dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'inbox' });
                dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation.id });
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Failed to send annotated image:', error);
            alert('Failed to send message. Please try again.');
            setShowToast(false);
        }
    };
    
    const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FFFFFF'];

    return (
        <div className="fixed inset-0 bg-black/80 z-[5000] flex flex-col" onWheel={handleWheel}>
            {showToast && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-20">
                    Image shared to chat!
                </div>
            )}
            <div className="flex-shrink-0 p-2 bg-neutral-900/50 flex justify-between items-center">
                {/* Toolbar */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-neutral-800/50 p-1.5 rounded-lg">
                        {colors.map(c => (
                            <button key={c} onClick={() => setColor(c)} style={{ backgroundColor: c }} className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-800' : ''}`} />
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-800/50 p-1.5 rounded-lg text-white">
                        <label className="text-sm font-semibold">Size:</label>
                        <input type="range" min="1" max="50" value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))} className="w-24" />
                    </div>
                    <button onClick={() => setPaths(paths.slice(0, -1))} className="p-2 bg-neutral-800/50 rounded-lg text-white hover:bg-neutral-700/50"><ArrowUturnLeftIcon className="w-5 h-5"/></button>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-4">
                     <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"><ArrowDownTrayIcon className="w-5 h-5"/> Download</button>
                     <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"><ShareIcon className="w-5 h-5"/> Share to Chat</button>
                     <button onClick={onClose} className="p-2 bg-neutral-800/50 rounded-full text-white hover:bg-neutral-700/50" aria-label="Close image editor"><XMarkIcon className="w-6 h-6"/></button>
                </div>
            </div>
            <div className="flex-grow relative overflow-hidden">
                <canvas 
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            </div>
        </div>
    );
};


// --- NeighborhoodInsights Component ---
const parseMarkdown = (text: string) => {
    const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const lines = sanitizedText.split('\n').filter(line => line.trim() !== '');
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

const NeighborhoodInsights: React.FC<{ lat: number; lng: number; city: string; country: string; }> = ({ lat, lng, city, country }) => {
    const { state, dispatch } = useAppContext();
    const [insights, setInsights] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRequested, setIsRequested] = useState(false);
    const [usage, setUsage] = useState<{ used: number; limit: number; remaining: number } | null>(null);

    const fetchInsights = async () => {
        // Check if user is authenticated
        if (!state.isAuthenticated || !state.currentUser) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } });
            return;
        }

        setIsRequested(true);
        setLoading(true);
        setError(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            const token = localStorage.getItem('balkan_estate_token');

            const response = await fetch(`${API_URL}/neighborhood-insights`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ lat, lng, city, country }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    // Rate limit exceeded
                    setError(data.message);
                    setUsage({ used: data.used, limit: data.limit, remaining: 0 });
                } else {
                    setError(data.message || 'Failed to fetch neighborhood insights');
                }
                return;
            }

            setInsights(data.insights);
            setUsage(data.usage);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError('An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (!isRequested) {
            const isAuthenticated = state.isAuthenticated && state.currentUser;
            return (
                <div className="text-center">
                    <p className="text-neutral-600 mb-4">
                        Discover what's around this property. Our AI can provide details on nearby schools, parks, and transport.
                    </p>
                    {!isAuthenticated && (
                        <p className="text-sm text-amber-600 mb-4 font-semibold">
                            🔒 Login required - Free users get 3 insights/month, premium users get 20/month
                        </p>
                    )}
                    <button
                        onClick={fetchInsights}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                    >
                        <SparklesIcon className="w-5 h-5"/>
                        {isAuthenticated ? 'Generate Insights' : 'Login & Generate Insights'}
                    </button>
                </div>
            );
        }

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
                    <p className="text-center"><strong>{error}</strong></p>
                    {usage && (
                        <p className="text-sm text-center mt-2">
                            Usage: {usage.used}/{usage.limit} insights used this month
                        </p>
                    )}
                    <div className="text-center">
                        <button onClick={fetchInsights} className="mt-3 text-sm font-semibold underline">Try again</button>
                    </div>
                </div>
            );
        }
        if (insights) {
            return (
                <>
                    <div className="prose prose-sm max-w-none text-neutral-700 space-y-3 animate-fade-in">
                        {parseMarkdown(insights)}
                    </div>
                    {usage && usage.remaining !== undefined && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800 text-center">
                                <strong>{usage.remaining}</strong> of {usage.limit} insights remaining this month
                                {usage.remaining === 0 && !state.currentUser?.isSubscribed && (
                                    <span className="block mt-1 text-xs">Upgrade to premium for more insights!</span>
                                )}
                            </p>
                        </div>
                    )}
                </>
            );
        }
        return null;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200">
            <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-8 h-8 mr-3 text-primary bg-primary-light rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-800">Neighborhood Insights</h3>
            </div>
            {renderContent()}
        </div>
    );
};


// --- Main Page Component ---
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

const Thumbnail: React.FC<{
    img: { url: string; tag: string },
    altText: string,
    className: string,
    onClick: () => void,
}> = ({ img, altText, className, onClick }) => {
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
    }, [img.url]);

    return (
        <div className={className} onClick={onClick}>
            {error ? (
                <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center rounded-lg">
                    <BuildingOfficeIcon className="w-8 h-8 text-neutral-400" />
                </div>
            ) : (
                <img 
                    src={img.url} 
                    alt={altText}
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setError(true)}
                />
            )}
        </div>
    )
};

const SharePopover: React.FC<{ property: Property, onClose: () => void }> = ({ property, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        const propertyUrl = `${window.location.origin}${window.location.pathname}?propertyId=${property.id}`;
        navigator.clipboard.writeText(propertyUrl).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                onClose();
            }, 1500);
        });
    };

    const getShareUrl = (service: 'facebook' | 'twitter' | 'whatsapp' | 'email') => {
        const propertyUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}?propertyId=${property.id}`);
        const text = encodeURIComponent(`Check out this property on Balkan Estate: ${property.address}, ${property.city}`);

        switch(service) {
            case 'facebook':
                return `https://www.facebook.com/sharer/sharer.php?u=${propertyUrl}`;
            case 'twitter':
                return `https://twitter.com/intent/tweet?url=${propertyUrl}&text=${text}`;
            case 'whatsapp':
                return `https://api.whatsapp.com/send?text=${text}%20${propertyUrl}`;
            case 'email':
                return `mailto:?subject=${encodeURIComponent(`Property Listing: ${property.address}`)}&body=${text}%0A%0A${propertyUrl}`;
        }
    };
    
    const openShareWindow = (url: string, service: 'email' | 'other' = 'other') => {
        if (service === 'email') {
            window.location.href = url;
        } else {
            window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
        }
        onClose();
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-neutral-200 p-4 z-20 animate-fade-in">
            <h4 className="font-bold text-neutral-800 mb-3 text-center">Share this Property</h4>
            <button
                onClick={handleCopyLink}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 font-semibold text-neutral-700 mb-2"
            >
                {copied ? '✅ Link Copied!' : '📋 Copy Link'}
            </button>
            <div className="border-t border-neutral-200 pt-2 flex items-center justify-around">
                <a href={getShareUrl('facebook')} onClick={(e) => { e.preventDefault(); openShareWindow(getShareUrl('facebook'))}} className="p-2 rounded-full hover:bg-blue-50 text-[#1877F2]">
                    <FacebookIcon className="w-7 h-7" />
                </a>
                <a href={getShareUrl('twitter')} onClick={(e) => { e.preventDefault(); openShareWindow(getShareUrl('twitter'))}} className="p-2 rounded-full hover:bg-neutral-100 text-black">
                    <TwitterIcon className="w-6 h-6" />
                </a>
                 <a href={getShareUrl('whatsapp')} onClick={(e) => { e.preventDefault(); openShareWindow(getShareUrl('whatsapp'))}} className="p-2 rounded-full hover:bg-green-50 text-[#25D366]">
                    <WhatsappIcon className="w-7 h-7" />
                </a>
                <a href={getShareUrl('email')} onClick={(e) => { e.preventDefault(); openShareWindow(getShareUrl('email'), 'email')}} className="p-2 rounded-full hover:bg-neutral-100 text-neutral-600">
                    <EnvelopeIcon className="w-7 h-7" />
                </a>
            </div>
        </div>
    );
};

const PropertyDetailsPage: React.FC<{ property: Property }> = ({ property }) => {
  const { state, dispatch, createConversation } = useAppContext();

  const [activeCategory, setActiveCategory] = useState<PropertyImageTag | 'all'>('all');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isFloorPlanOpen, setIsFloorPlanOpen] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);
  const [isSharePopoverOpen, setIsSharePopoverOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'photos' | 'streetview'>('photos'); // Default to photos
  const [isStreetViewAvailable, setIsStreetViewAvailable] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const shareContainerRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLIFrameElement>(null);

  // Check if street view is available for this location
  useEffect(() => {
    // Create a script to load Google Maps Street View Service
    const checkStreetView = () => {
      const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${property.lat},${property.lng}&radius=100&key=YOUR_API_KEY`;

      // For now, we'll use an iframe load error handler as a fallback
      // If street view is not available, the iframe will show "no imagery"
      // We'll detect this and switch to photos mode
      const timeout = setTimeout(() => {
        // After 3 seconds, assume street view loaded successfully
        setIsStreetViewAvailable(true);
      }, 3000);

      return () => clearTimeout(timeout);
    };

    if (viewMode === 'streetview') {
      checkStreetView();
    }
  }, [property.lat, property.lng, viewMode]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
        if (shareContainerRef.current && !shareContainerRef.current.contains(event.target as Node)) {
            setIsSharePopoverOpen(false);
        }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);
  
  const allImages = useMemo(() => {
    const images = property.images || [];
    const mainImage = { url: property.imageUrl, tag: 'exterior' as PropertyImageTag };
    const combined = [mainImage, ...images];
    return combined.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
  }, [property.imageUrl, property.images]);

  const categorizedImages = useMemo(() => {
    return allImages.reduce((acc, img) => {
        const tag = img.tag || 'other';
        if (!acc[tag]) {
            acc[tag] = [];
        }
        acc[tag].push(img);
        return acc;
    }, {} as Record<PropertyImageTag, { url: string; tag: PropertyImageTag }[]>);
  }, [allImages]);

  const imagesForCurrentCategory = useMemo(() => {
    if (activeCategory === 'all') {
        return allImages;
    }
    return categorizedImages[activeCategory] || [];
  }, [activeCategory, allImages, categorizedImages]);

  const currentImageUrl = imagesForCurrentCategory[currentImageIndex]?.url || property.imageUrl;

  useEffect(() => {
    setMainImageError(false);
  }, [currentImageUrl]);
  
  const handleCategorySelect = useCallback((tag: PropertyImageTag | 'all') => {
    setActiveCategory(tag);
    setCurrentImageIndex(0);
  }, []);

  const handleNextImage = useCallback(() => {
      setCurrentImageIndex(prev => (prev + 1) % imagesForCurrentCategory.length);
  }, [imagesForCurrentCategory.length]);

  const handlePrevImage = useCallback(() => {
      setCurrentImageIndex(prev => (prev - 1 + imagesForCurrentCategory.length) % imagesForCurrentCategory.length);
  }, [imagesForCurrentCategory.length]);

  const handleBack = () => {
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
    // Update browser history to maintain navigation graph
    window.history.pushState({}, '', '/search');
  };

  // Handle browser/mobile back button
  useEffect(() => {
    const handlePopState = () => {
      // When user presses back button, close property details
      dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [dispatch]);

  const handleFavoriteClick = () => {
      if (!state.isAuthenticated && !state.user) {
          dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } });
      } else {
          dispatch({ type: 'TOGGLE_SAVED_HOME', payload: property });
      }
  };

  const handleContactSeller = async () => {
      if (!state.isAuthenticated) {
          dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } });
          return;
      }

      dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'inbox' });

      setIsCreatingConversation(true);
      try {
          const conversation = await createConversation(property.id);
          dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation.id });
      } catch (error) {
          alert('Failed to start conversation. Please try again.');
      } finally {
          setIsCreatingConversation(false);
      }
  };

  const isFavorited = state.savedHomes.some(p => p.id === property.id);

  return (
    <div className="bg-neutral-50 h-full overflow-y-auto animate-fade-in">
        {isEditorOpen && <ImageEditorModal imageUrl={currentImageUrl} property={property} onClose={() => setIsEditorOpen(false)} />}
        {isViewerOpen && <ImageViewerModal images={imagesForCurrentCategory} startIndex={currentImageIndex} onClose={() => setIsViewerOpen(false)} />}
        {isFloorPlanOpen && property.floorplanUrl && (
            <FloorPlanViewerModal imageUrl={property.floorplanUrl} onClose={() => setIsFloorPlanOpen(false)} />
        )}
        <div className="p-4 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 flex items-center justify-between">
            <button onClick={handleBack} className="flex items-center gap-2 text-primary font-semibold hover:underline" aria-label="Go back to search results">
                <ArrowLeftIcon className="w-5 h-5" />
                Back
            </button>
            <div onClick={property.status === 'sold' ? undefined : handleFavoriteClick} className={`bg-white p-2 rounded-full border border-neutral-200 ${property.status === 'sold' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors duration-300 ${property.status === 'sold' ? 'text-neutral-300' : isFavorited ? 'text-red-500 fill-current' : 'text-neutral-500 hover:text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5
 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </div>
        </div>
      
      <main className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
                <div className="relative w-full h-[250px] sm:h-[400px] lg:h-[450px] bg-neutral-200">
                    {viewMode === 'photos' ? (
                        <button onClick={() => setIsViewerOpen(true)} className="relative w-full h-full block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t-xl">
                            {mainImageError ? (
                                <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                                    <BuildingOfficeIcon className="w-24 h-24 text-neutral-400" />
                                </div>
                            ) : (
                                <img
                                    key={currentImageUrl}
                                    src={currentImageUrl}
                                    alt={property.address}
                                    className="w-full h-full object-cover animate-image-fade"
                                    onError={() => setMainImageError(true)}
                                />
                            )}
                        </button>
                    ) : (
                        <div className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
                            <iframe
                                ref={streetViewRef}
                                src={`https://www.google.com/maps?layer=c&cbll=${property.lat},${property.lng}&cbp=12,0,0,0,0&output=svembed`}
                                className="w-full h-full border-0"
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                            {/* Fullscreen button for mobile */}
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors z-10 md:hidden"
                                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                            >
                                {isFullscreen ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}

                    {viewMode === 'photos' && (
                        <>
                            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                                <button onClick={(e) => { e.stopPropagation(); setIsEditorOpen(true); }} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-neutral-800 font-semibold px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-md">
                                    <PencilIcon className="w-5 h-5" />
                                    <span className="hidden sm:inline">Annotate</span>
                                </button>
                                <div className="relative" ref={shareContainerRef}>
                                    <button onClick={(e) => { e.stopPropagation(); setIsSharePopoverOpen(prev => !prev); }} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-neutral-800 font-semibold px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-md">
                                        <ShareIcon className="w-5 h-5" />
                                        <span className="hidden sm:inline">Share</span>
                                    </button>
                                    {isSharePopoverOpen && <SharePopover property={property} onClose={() => setIsSharePopoverOpen(false)} />}
                                </div>
                                {property.tourUrl && (
                                    <a href={property.tourUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-neutral-800 font-semibold px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-md">
                                        <VideoCameraIcon className="w-5 h-5" />
                                        <span className="hidden sm:inline">3D Tour</span>
                                    </a>
                                )}
                            </div>
                            {imagesForCurrentCategory.length > 1 && (
                                <>
                                    <button onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors shadow-md z-10">
                                        <ChevronLeftIcon className="w-6 h-6 text-neutral-800"/>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleNextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors shadow-md z-10">
                                        <ChevronRightIcon className="w-6 h-6 text-neutral-800"/>
                                    </button>
                                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full px-4 z-10">
                                      <div className="flex items-center justify-center h-10">
                                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-full">
                                            {imagesForCurrentCategory.map((img, index) => (
                                                <button
                                                    key={index}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentImageIndex(index);
                                                    }}
                                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                                        index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                                                    }`}
                                                    aria-label={`Go to image ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                      </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-lg">
                            <button
                                onClick={() => setViewMode('photos')}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${viewMode === 'photos' ? 'bg-primary text-white shadow' : 'text-neutral-700 hover:bg-neutral-200'}`}
                            >
                                Photos
                            </button>
                            <button
                                onClick={() => setViewMode('streetview')}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${viewMode === 'streetview' ? 'bg-primary text-white shadow' : 'text-neutral-700 hover:bg-neutral-200'}`}
                            >
                                <StreetViewIcon className="w-5 h-5" />
                                Street View
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    {property.status === 'sold' && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-neutral-100 to-neutral-200 border-l-4 border-neutral-600 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-6 h-6 text-neutral-700" />
                                <span className="font-bold text-lg text-neutral-800">Property Sold</span>
                            </div>
                            <p className="text-sm text-neutral-600 mt-1">This property has been sold and is no longer available.</p>
                        </div>
                    )}
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900">{formatPrice(property.price, property.country)}</p>
                    <a
                    href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-neutral-600 mt-2 group"
                    title="Open in Google Maps"
                    >
                        <MapPinIcon className="w-5 h-5 mr-2 text-neutral-400 group-hover:text-primary transition-colors" />
                        <span className="text-sm sm:text-base lg:text-lg group-hover:underline group-hover:text-primary transition-colors">{property.address}, {property.city}, {property.country}</span>
                    </a>
                    <div className="mt-6 flex flex-wrap justify-around text-base sm:text-lg text-neutral-800 border-t border-neutral-200 pt-4 gap-4">
                    <div className="flex items-center gap-3"><BedIcon className="w-6 h-6 text-primary" /><span><span className="font-bold">{property.beds}</span> beds</span></div>
                    <div className="flex items-center gap-3"><BathIcon className="w-6 h-6 text-primary" /><span><span className="font-bold">{property.baths}</span> baths</span></div>
                    <div className="flex items-center gap-3"><LivingRoomIcon className="w-6 h-6 text-primary" /><span><span className="font-bold">{property.livingRooms}</span> {property.livingRooms === 1 ? 'living room' : 'living rooms'}</span></div>
                    <div className="flex items-center gap-3"><SqftIcon className="w-6 h-6 text-primary" /><span><span className="font-bold">{property.sqft}</span> m²</span></div>
                    </div>
                </div>
            </div>
            
             <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200">
                <h3 className="text-lg sm:text-xl font-bold text-neutral-800 mb-4">Photos</h3>
                <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-4 mb-4">
                    <button onClick={() => handleCategorySelect('all')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeCategory === 'all' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>All</button>
                    {Object.keys(categorizedImages).map(tag => (
                        <button key={tag} onClick={() => handleCategorySelect(tag as PropertyImageTag)} className={`capitalize px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeCategory === tag ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>
                            {tag.replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagesForCurrentCategory.map((img, index) => (
                        <Thumbnail
                            key={img.url}
                            img={img}
                            altText={`${property.address} - ${img.tag} ${index + 1}`}
                            className={`w-full h-32 cursor-pointer border-2 transition-colors ${index === currentImageIndex ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                            onClick={() => setCurrentImageIndex(index)}
                        />
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200">
                <h3 className="text-lg sm:text-xl font-bold text-neutral-800 mb-4">About This Home</h3>
                <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap">
                    {property.description}
                </div>
            </div>
            
             <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200">
                <h3 className="text-lg sm:text-xl font-bold text-neutral-800 mb-6">Property Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-4">
                    <DetailItem icon={<CalendarIcon />} label="Year Built">{property.yearBuilt}</DetailItem>
                    <DetailItem icon={<ParkingIcon />} label="Parking">{property.parking > 0 ? `${property.parking} ${property.parking === 1 ? 'spot' : 'spots'}` : 'None'}</DetailItem>
                    
                    {property.propertyType === 'apartment' && property.floorNumber && (
                        <DetailItem icon={<BuildingOfficeIcon />} label="Floor">{property.floorNumber}</DetailItem>
                    )}
                    {(property.propertyType === 'house' || property.propertyType === 'villa') && property.totalFloors && (
                         <DetailItem icon={<BuildingOfficeIcon />} label="Floors">{property.totalFloors}</DetailItem>
                    )}

                    {property.floorplanUrl && (
                        <div className="sm:col-span-2">
                             <DetailItem icon={<CubeTransparentIcon />} label="Floor Plan">
                                <button
                                    onClick={() => setIsFloorPlanOpen(true)}
                                    className="px-4 py-2 bg-primary-light text-primary-dark font-semibold rounded-lg hover:bg-primary/20 transition-colors"
                                >
                                    View Interactive Floor Plan
                                </button>
                            </DetailItem>
                        </div>
                    )}

                    <div className="sm:col-span-2">
                        <DetailItem icon={<StarIcon />} label="Special Features">
                             {Array.isArray(property.specialFeatures) && property.specialFeatures.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">{property.specialFeatures.map(feature => <li key={feature}>{feature}</li>)}</ul>
                            ) : 'Not listed'}
                        </DetailItem>
                    </div>
                    <div className="sm:col-span-2">
                         <DetailItem icon={<CubeIcon />} label="Materials">
                             {Array.isArray(property.materials) && property.materials.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">{property.materials.map(material => <li key={material}>{material}</li>)}</ul>
                            ) : 'Not listed'}
                        </DetailItem>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200">
                <h3 className="text-lg sm:text-xl font-bold text-neutral-800 mb-4">View on Map</h3>
                <p className="text-neutral-600 mb-4">Want to explore the area around this property?</p>
                <button
                    onClick={() => {
                        // Set the property location to focus on the map
                        dispatch({
                            type: 'UPDATE_SEARCH_PAGE_STATE',
                            payload: {
                                focusMapOnProperty: {
                                    lat: property.lat,
                                    lng: property.lng,
                                    address: property.address,
                                },
                            },
                        });
                        // Navigate to search view
                        dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
                        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                >
                    <MapPinIcon className="w-5 h-5" />
                    View on Search Map
                </button>
            </div>

            <NeighborhoodInsights 
                lat={property.lat} 
                lng={property.lng} 
                city={property.city} 
                country={property.country} 
            />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-lg border border-neutral-200">
                  <h3 className="text-base sm:text-lg font-bold text-neutral-800 mb-4">Contact Seller</h3>
                  <div className="flex items-center gap-4 mb-4">
                      {property.seller?.avatarUrl ? (
                          <img src={property.seller.avatarUrl} alt={property.seller.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                          <UserCircleIcon className="w-12 h-12 text-neutral-300" />
                      )}
                      <div>
                          <p className="font-bold text-base text-neutral-900">{property.seller?.name}</p>
                          <p className="text-xs text-neutral-600 capitalize">{property.seller?.type}</p>
                      </div>
                  </div>
                  <div className="space-y-2">
                      {property.status === 'sold' ? (
                          <div className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-neutral-300 rounded-lg shadow-sm text-sm font-medium text-neutral-400 bg-neutral-100 cursor-not-allowed">
                              <PhoneIcon className="w-4 h-4" />
                              Property Sold
                          </div>
                      ) : (
                          <a href={`tel:${property.seller?.phone}`} className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark">
                              <PhoneIcon className="w-4 h-4" />
                              Call Seller
                          </a>
                      )}
                       <button
                          onClick={handleContactSeller}
                          disabled={isCreatingConversation || property.status === 'sold'}
                          className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-primary text-primary rounded-lg shadow-sm text-sm font-medium bg-white hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                          {isCreatingConversation ? 'Starting Chat...' : property.status === 'sold' ? 'Property Sold' : 'Message Seller'}
                      </button>
                  </div>
              </div>
              <MortgageCalculator propertyPrice={property.price} country={property.country} />
              <RentVsBuyCalculator propertyPrice={property.price} country={property.country} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetailsPage;