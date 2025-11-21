import React from 'react';
import { useAppContext } from '../../context/AppContext';
import {
    LogoIcon,
    HomeIcon,
    SearchIcon,
    BuildingOfficeIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    HeartIcon,
    UserGroupIcon,
    BuildingLibraryIcon,
    FacebookIcon,
    TwitterIcon,
    WhatsappIcon,
    InboxIcon
} from '../../constants';
import FooterCityscape from './FooterCityscape';

interface FooterProps {
    className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
    const currentYear = new Date().getFullYear();
    const { dispatch } = useAppContext();

    const handleNavigation = (view: 'search' | 'saved-searches' | 'saved-properties' | 'inbox' | 'account' | 'create-listing' | 'agents' | 'agencies' | 'admin') => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
        window.history.pushState({}, '', `/${view === 'search' ? '' : view}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className={`relative bg-gradient-to-br from-primary-dark via-primary to-primary text-white overflow-hidden ${className}`}>
            {/* Subtle Dot Pattern Background */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}></div>

            {/* Accent Decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-yellow-400 to-secondary"></div>

            {/* Main Footer Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 md:py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {/* Brand Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                                <LogoIcon className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold">Balkan Estate</span>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed">
                            Finding perfect properties across the Balkans.
                        </p>

                        {/* Social Media Links */}
                        <div className="flex gap-2 pt-1">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-300"
                                aria-label="Facebook"
                            >
                                <FacebookIcon className="w-4 h-4" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-300"
                                aria-label="Twitter"
                            >
                                <TwitterIcon className="w-4 h-4" />
                            </a>
                            <a
                                href="https://wa.me/383XXXXXXX"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-300"
                                aria-label="WhatsApp"
                            >
                                <WhatsappIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* For Buyers */}
                    <div>
                        <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
                            <div className="w-0.5 h-4 bg-secondary rounded-full"></div>
                            For Buyers
                        </h3>
                        <ul className="space-y-1.5">
                            <li>
                                <button
                                    onClick={() => handleNavigation('search')}
                                    className="group flex items-center gap-2 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <SearchIcon className="w-3 h-3 text-secondary group-hover:text-white transition-colors" />
                                    <span className="text-xs text-white/80 group-hover:text-white font-medium">Search Properties</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleNavigation('saved-properties')}
                                    className="group flex items-center gap-2 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <HeartIcon className="w-3 h-3 text-secondary group-hover:text-white transition-colors" />
                                    <span className="text-xs text-white/80 group-hover:text-white font-medium">Saved Properties</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleNavigation('agents')}
                                    className="group flex items-center gap-2 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <UserGroupIcon className="w-3 h-3 text-secondary group-hover:text-white transition-colors" />
                                    <span className="text-xs text-white/80 group-hover:text-white font-medium">Find Agents</span>
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* For Sellers */}
                    <div>
                        <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
                            <div className="w-0.5 h-4 bg-secondary rounded-full"></div>
                            For Sellers
                        </h3>
                        <ul className="space-y-1.5">
                            <li>
                                <button
                                    onClick={() => handleNavigation('create-listing')}
                                    className="group flex items-center gap-2 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <BuildingOfficeIcon className="w-3 h-3 text-secondary group-hover:text-white transition-colors" />
                                    <span className="text-xs text-white/80 group-hover:text-white font-medium">List Property</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleNavigation('inbox')}
                                    className="group flex items-center gap-2 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <InboxIcon className="w-3 h-3 text-secondary group-hover:text-white transition-colors" />
                                    <span className="text-xs text-white/80 group-hover:text-white font-medium">Messages</span>
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
                            <div className="w-0.5 h-4 bg-secondary rounded-full"></div>
                            Contact
                        </h3>
                        <ul className="space-y-1.5">
                            <li>
                                <a href="tel:+383XXXXXXX" className="flex items-center gap-2 hover:translate-x-1 transition-all duration-200">
                                    <PhoneIcon className="w-3 h-3 text-secondary flex-shrink-0" />
                                    <span className="text-xs text-white/80 font-medium">+383 XX XXX XXX</span>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:info@balkanestate.com" className="flex items-center gap-2 hover:translate-x-1 transition-all duration-200">
                                    <EnvelopeIcon className="w-3 h-3 text-secondary flex-shrink-0" />
                                    <span className="text-xs text-white/80 font-medium">info@balkanestate.com</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="relative z-10 border-t border-white/20 bg-primary-dark/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs">
                        <p className="text-white/70">
                            © {currentYear} <span className="font-semibold text-white">Balkan Estate</span>
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <a href="#" className="text-white/70 hover:text-secondary transition-colors">Privacy</a>
                            <a href="#" className="text-white/70 hover:text-secondary transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animated Cityscape */}
            <FooterCityscape />
        </footer>
    );
};

export default Footer;
