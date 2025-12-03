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
    InboxIcon,
    BellIcon,
    UserCircleIcon
} from '../../constants';
import FooterCityscape from './FooterCityscape';

interface FooterProps {
    className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
    const currentYear = new Date().getFullYear();
    const { dispatch, state } = useAppContext();

    const handleNavigation = (view: 'search' | 'saved-searches' | 'saved-properties' | 'inbox' | 'account' | 'create-listing' | 'agents' | 'agencies' | 'admin') => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
        window.history.pushState({}, '', `/${view === 'search' ? '' : view}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className={`relative bg-gray-50 text-gray-900 border-t border-gray-200 ${className}`}>
            {/* Main Footer Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Brand Section */}
                    <div className="col-span-2 md:col-span-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg">
                                <LogoIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base font-semibold text-gray-900">Balkan Estate</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed max-w-xs">
                            Finding perfect properties across the Balkans.
                        </p>
                    </div>

                    {/* For Buyers */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase">
                            For Buyers
                        </h3>
                        <ul className="space-y-1">
                            {[
                                { label: 'Search', view: 'search' },
                                { label: 'Saved', view: 'saved-properties' },
                                { label: 'Agents', view: 'agents' }
                            ].map(({ label, view }) => (
                                <li key={label}>
                                    <button
                                        onClick={() => handleNavigation(view as any)}
                                        className="text-xs text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        {label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Sellers */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase">
                            For Sellers
                        </h3>
                        <ul className="space-y-1">
                            {[
                                { label: 'List Property', view: 'create-listing' },
                                { label: 'Messages', view: 'inbox' },
                                { label: 'Account', view: 'account' }
                            ].map(({ label, view }) => (
                                <li key={label}>
                                    <button
                                        onClick={() => handleNavigation(view as any)}
                                        className="text-xs text-gray-600 hover:text-green-600 transition-colors"
                                    >
                                        {label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase">
                            Contact
                        </h3>
                        <ul className="space-y-1">
                            <li>
                                <a href="mailto:info@balkanestate.com" className="text-xs text-gray-600 hover:text-purple-600 transition-colors">
                                    info@balkanestate.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="relative z-10 border-t border-gray-200 bg-white/80">
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <p className="text-xs text-gray-600 text-center">
                        © {currentYear} Balkan Estate. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;