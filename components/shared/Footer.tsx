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
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand Section */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <LogoIcon className="w-8 h-8" />
                            </div>
                            <span className="text-2xl font-bold">Balkan Estate</span>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">
                            Your trusted partner in finding the perfect property across the Balkans. Making real estate simple, transparent, and accessible.
                        </p>
                        <div className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPinIcon className="w-5 h-5 text-secondary flex-shrink-0" />
                                <span className="font-semibold text-sm">Available in 10 Countries:</span>
                            </div>
                            <p className="text-xs text-white/90 leading-relaxed">
                                Albania, Bosnia and Herzegovina, Bulgaria, Croatia, Greece, Kosovo, Montenegro, North Macedonia, Romania, and Serbia
                            </p>
                        </div>

                        {/* Social Media Links */}
                        <div className="pt-2">
                            <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-white/70">Connect With Us</p>
                            <div className="flex gap-3">
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-lg"
                                    aria-label="Facebook"
                                >
                                    <FacebookIcon className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-lg"
                                    aria-label="Twitter"
                                >
                                    <TwitterIcon className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://wa.me/383XXXXXXX"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-lg"
                                    aria-label="WhatsApp"
                                >
                                    <WhatsappIcon className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* For Buyers */}
                    <div>
                        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                            <div className="w-1 h-6 bg-secondary rounded-full"></div>
                            For Buyers
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <button
                                    onClick={() => handleNavigation('search')}
                                    className="group flex items-center gap-3 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <SearchIcon className="w-4 h-4 text-secondary group-hover:text-white transition-colors" />
                                    <span className="text-sm text-white/80 group-hover:text-white font-medium">Search Properties</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleNavigation('saved-properties')}
                                    className="group flex items-center gap-3 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <HeartIcon className="w-4 h-4 text-secondary group-hover:text-white transition-colors" />
                                    <span className="text-sm text-white/80 group-hover:text-white font-medium">Saved Properties</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleNavigation('saved-searches')}
                                    className="group flex items-center gap-3 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <HomeIcon className="w-4 h-4 text-secondary group-hover:text-white transition-colors" />
                                    <span className="text-sm text-white/80 group-hover:text-white font-medium">Saved Searches</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleNavigation('agents')}
                                    className="group flex items-center gap-3 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <UserGroupIcon className="w-4 h-4 text-secondary group-hover:text-white transition-colors" />
                                    <span className="text-sm text-white/80 group-hover:text-white font-medium">Find Agents</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleNavigation('agencies')}
                                    className="group flex items-center gap-3 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <BuildingLibraryIcon className="w-4 h-4 text-secondary group-hover:text-white transition-colors" />
                                    <span className="text-sm text-white/80 group-hover:text-white font-medium">Browse Agencies</span>
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* For Sellers */}
                    <div>
                        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                            <div className="w-1 h-6 bg-secondary rounded-full"></div>
                            For Sellers
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <button
                                    onClick={() => handleNavigation('create-listing')}
                                    className="group flex items-center gap-3 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <BuildingOfficeIcon className="w-4 h-4 text-secondary group-hover:text-white transition-colors" />
                                    <span className="text-sm text-white/80 group-hover:text-white font-medium">List Your Property</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleNavigation('inbox')}
                                    className="group flex items-center gap-3 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <InboxIcon className="w-4 h-4 text-secondary group-hover:text-white transition-colors" />
                                    <span className="text-sm text-white/80 group-hover:text-white font-medium">Messages</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: true } })}
                                    className="group flex items-center gap-3 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <span className="text-sm text-white/80 group-hover:text-white font-medium">Pricing Plans</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleNavigation('account')}
                                    className="group flex items-center gap-3 hover:translate-x-1 transition-all duration-200 text-left w-full"
                                >
                                    <span className="text-sm text-white/80 group-hover:text-white font-medium">My Account</span>
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Support */}
                    <div>
                        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                            <div className="w-1 h-6 bg-secondary rounded-full"></div>
                            Get in Touch
                        </h3>
                        <ul className="space-y-4">
                            <li className="group">
                                <a
                                    href="tel:+383XXXXXXX"
                                    className="flex items-start gap-3 hover:translate-x-1 transition-all duration-200"
                                >
                                    <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                                        <PhoneIcon className="w-4 h-4 text-secondary flex-shrink-0" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/60 mb-0.5">Call us</p>
                                        <p className="text-sm font-semibold group-hover:text-secondary transition-colors">
                                            +383 XX XXX XXX
                                        </p>
                                    </div>
                                </a>
                            </li>
                            <li className="group">
                                <a
                                    href="mailto:info@balkanestate.com"
                                    className="flex items-start gap-3 hover:translate-x-1 transition-all duration-200"
                                >
                                    <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                                        <EnvelopeIcon className="w-4 h-4 text-secondary flex-shrink-0" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/60 mb-0.5">Email us</p>
                                        <p className="text-sm font-semibold group-hover:text-secondary transition-colors break-all">
                                            info@balkanestate.com
                                        </p>
                                    </div>
                                </a>
                            </li>
                        </ul>

                        {/* Quick Support Links */}
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-white/70">Support</p>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="#" className="text-white/80 hover:text-secondary transition-colors">Help Center</a>
                                </li>
                                <li>
                                    <a href="#" className="text-white/80 hover:text-secondary transition-colors">FAQ</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="mt-12 pt-8 border-t border-white/20">
                    <div className="max-w-2xl mx-auto text-center">
                        <h3 className="text-xl font-bold mb-2">Never Miss a New Listing</h3>
                        <p className="text-sm text-white/80 mb-6">Get instant notifications for properties matching your search criteria</p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <button
                                onClick={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: true })}
                                className="w-full px-8 py-3 bg-secondary hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
                            >
                                Subscribe for Notifications
                            </button>
                        </div>
                        <p className="text-xs text-white/70 mt-3">€1.50/month - Cancel anytime</p>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="relative z-10 border-t border-white/20 bg-primary-dark/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <p className="text-white/70">
                            © {currentYear} <span className="font-semibold text-white">Balkan Estate</span>. All rights reserved.
                        </p>
                        <div className="flex flex-wrap gap-6 justify-center">
                            <a href="#" className="text-white/70 hover:text-secondary transition-colors font-medium">Privacy Policy</a>
                            <a href="#" className="text-white/70 hover:text-secondary transition-colors font-medium">Terms of Service</a>
                            <a href="#" className="text-white/70 hover:text-secondary transition-colors font-medium">Cookie Policy</a>
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
