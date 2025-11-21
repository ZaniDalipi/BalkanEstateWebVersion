import React from 'react';
import { useAppContext } from '../../context/AppContext';
import {
    LogoIcon,
    SearchIcon,
    BuildingOfficeIcon,
    PhoneIcon,
    EnvelopeIcon,
    HeartIcon,
    UserGroupIcon,
    FacebookIcon,
    TwitterIcon,
    WhatsappIcon,
    InboxIcon
} from '../../constants';

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
        <footer className={`bg-gray-100 border-t border-gray-200 ${className}`}>
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {/* Brand Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <LogoIcon className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">Balkan Estate</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Finding perfect properties across the Balkans.
                        </p>

                        {/* Social Media Links */}
                        <div className="flex gap-2 pt-1">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-gray-200 hover:bg-primary hover:text-white rounded-lg transition-all duration-200"
                                aria-label="Facebook"
                            >
                                <FacebookIcon className="w-4 h-4" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-gray-200 hover:bg-primary hover:text-white rounded-lg transition-all duration-200"
                                aria-label="Twitter"
                            >
                                <TwitterIcon className="w-4 h-4" />
                            </a>
                            <a
                                href="https://wa.me/383XXXXXXX"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-gray-200 hover:bg-primary hover:text-white rounded-lg transition-all duration-200"
                                aria-label="WhatsApp"
                            >
                                <WhatsappIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* For Buyers */}
                    <div>
                        <h3 className="text-sm font-bold mb-3 text-gray-900">
                            For Buyers
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => handleNavigation('search')}
                                    className="group flex items-center gap-2 hover:translate-x-0.5 transition-all duration-200 text-left w-full"
                                >
                                    <SearchIcon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900">Search Properties</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleNavigation('saved-properties')}
                                    className="group flex items-center gap-2 hover:translate-x-0.5 transition-all duration-200 text-left w-full"
                                >
                                    <HeartIcon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900">Saved Properties</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleNavigation('agents')}
                                    className="group flex items-center gap-2 hover:translate-x-0.5 transition-all duration-200 text-left w-full"
                                >
                                    <UserGroupIcon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900">Find Agents</span>
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* For Sellers */}
                    <div>
                        <h3 className="text-sm font-bold mb-3 text-gray-900">
                            For Sellers
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => handleNavigation('create-listing')}
                                    className="group flex items-center gap-2 hover:translate-x-0.5 transition-all duration-200 text-left w-full"
                                >
                                    <BuildingOfficeIcon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900">List Property</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleNavigation('inbox')}
                                    className="group flex items-center gap-2 hover:translate-x-0.5 transition-all duration-200 text-left w-full"
                                >
                                    <InboxIcon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900">Messages</span>
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-bold mb-3 text-gray-900">
                            Contact
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="tel:+383XXXXXXX" className="flex items-center gap-2 hover:translate-x-0.5 transition-all duration-200">
                                    <PhoneIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-600">+383 XX XXX XXX</span>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:info@balkanestate.com" className="flex items-center gap-2 hover:translate-x-0.5 transition-all duration-200">
                                    <EnvelopeIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-600">info@balkanestate.com</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm">
                        <p className="text-gray-500">
                            © {currentYear} <span className="font-semibold text-gray-700">Balkan Estate</span>
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <a href="#" className="text-gray-500 hover:text-primary transition-colors">Privacy</a>
                            <a href="#" className="text-gray-500 hover:text-primary transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
