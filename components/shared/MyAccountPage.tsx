import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import MyListings from './MyListings';
import { User, UserRole } from '../../types';
import PropertyDetailsPage from '../BuyerFlow/PropertyDetailsPage';
// FIX: Added ArrowLeftOnRectangleIcon to imports to fix missing member error.
import { BuildingOfficeIcon, ChartBarIcon, UserCircleIcon, ArrowLeftOnRectangleIcon } from '../../constants';

type AccountTab = 'listings' | 'performance' | 'profile' | 'subscription';

const TabButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors w-full text-left ${
            isActive
                ? 'bg-primary-light text-primary-dark'
                : 'text-neutral-600 hover:bg-neutral-100'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const ProfileSettings: React.FC<{ user: User }> = ({ user }) => {
    // A simple form to display and edit user profile data
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-neutral-800">Profile Settings</h3>
            <div className="relative">
                <input type="text" id="name" defaultValue={user.name} className="block px-2.5 pb-2.5 pt-4 w-full text-base text-neutral-900 bg-white rounded-lg border border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer" placeholder=" " />
                <label htmlFor="name" className="absolute text-base text-neutral-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">Full Name</label>
            </div>
            <div className="relative">
                <input type="email" id="email" defaultValue={user.email} className="block px-2.5 pb-2.5 pt-4 w-full text-base text-neutral-900 bg-white rounded-lg border border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer" placeholder=" " />
                <label htmlFor="email" className="absolute text-base text-neutral-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">Email</label>
            </div>
            <div className="relative">
                <input type="tel" id="phone" defaultValue={user.phone} className="block px-2.5 pb-2.5 pt-4 w-full text-base text-neutral-900 bg-white rounded-lg border border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer" placeholder=" " />
                <label htmlFor="phone" className="absolute text-base text-neutral-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">Phone</label>
            </div>
            <div className="flex justify-end">
                <button className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-dark">Save Changes</button>
            </div>
        </div>
    );
};

const MyAccountPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [activeTab, setActiveTab] = useState<AccountTab>('listings');

    if (state.selectedProperty && state.userRole === UserRole.SELLER) {
        return <PropertyDetailsPage property={state.selectedProperty} />;
    }

    if (!state.currentUser) {
        return (
            <div className="p-8 text-center">
                <p>You must be logged in to view this page.</p>
            </div>
        );
    }
    
    const handleLogout = () => {
        dispatch({ type: 'SET_AUTH_STATE', payload: { isAuthenticated: false, user: null } });
        dispatch({ type: 'SET_USER_ROLE', payload: UserRole.BUYER }); // Default to buyer view on logout
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'listings':
                return <MyListings sellerId={state.currentUser!.id} />;
            case 'profile':
                return <ProfileSettings user={state.currentUser!} />;
            case 'performance':
                 return <div className="text-center p-8"><h3 className="text-xl font-bold">Performance Analytics Coming Soon!</h3></div>;
            case 'subscription':
                 return <div className="text-center p-8"><h3 className="text-xl font-bold">Subscription Management Coming Soon!</h3></div>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-neutral-50 min-h-full">
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-4 rounded-xl shadow-md border border-neutral-200">
                             <div className="flex flex-col items-center text-center pb-4 mb-4 border-b">
                                {state.currentUser.avatarUrl ? (
                                    <img src={state.currentUser.avatarUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover mb-3" />
                                ) : (
                                    <UserCircleIcon className="w-24 h-24 text-neutral-300 mb-3" />
                                )}
                                <h2 className="font-bold text-xl text-neutral-800">{state.currentUser.name}</h2>
                                <p className="text-sm text-neutral-500 capitalize">{state.currentUser.role}</p>
                            </div>
                            <nav className="space-y-2">
                                <TabButton label="My Listings" icon={<BuildingOfficeIcon className="w-6 h-6"/>} isActive={activeTab === 'listings'} onClick={() => setActiveTab('listings')} />
                                <TabButton label="Performance" icon={<ChartBarIcon className="w-6 h-6"/>} isActive={activeTab === 'performance'} onClick={() => setActiveTab('performance')} />
                                <TabButton label="Profile Settings" icon={<UserCircleIcon className="w-6 h-6"/>} isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors w-full text-left text-red-600 hover:bg-red-50 mt-4">
                                    <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                                    <span>Logout</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-3">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-neutral-200 min-h-[600px]">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyAccountPage;