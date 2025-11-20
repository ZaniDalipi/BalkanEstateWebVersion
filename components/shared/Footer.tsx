import React from 'react';
import { LogoIcon, HomeIcon, SearchIcon, BuildingOfficeIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '../../constants';

interface FooterProps {
    className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`bg-neutral-900 text-neutral-300 ${className}`}>
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <LogoIcon className="w-8 h-8" />
                            <span className="text-xl font-bold text-white">Balkan Estate</span>
                        </div>
                        <p className="text-sm text-neutral-400">
                            Your trusted partner in finding the perfect property across the Balkans.
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPinIcon className="w-4 h-4 text-primary" />
                            <span>Serving Albania, Kosovo, and beyond</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                                    <HomeIcon className="w-4 h-4" />
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                                    <SearchIcon className="w-4 h-4" />
                                    Search Properties
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                                    <BuildingOfficeIcon className="w-4 h-4" />
                                    List Your Property
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="hover:text-white transition-colors">About Us</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors">How It Works</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors">FAQ</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors">Blog</a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <PhoneIcon className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                <div>
                                    <a href="tel:+383" className="hover:text-white transition-colors">
                                        +383 XX XXX XXX
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <EnvelopeIcon className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                <div>
                                    <a href="mailto:info@balkanestate.com" className="hover:text-white transition-colors">
                                        info@balkanestate.com
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-400">
                        <p>© {currentYear} Balkan Estate. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
