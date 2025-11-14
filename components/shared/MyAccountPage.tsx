import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import MyListings from './MyListings';
import { User, UserRole } from '../../types';
import { BuildingOfficeIcon, ChartBarIcon, UserCircleIcon, ArrowLeftOnRectangleIcon } from '../../constants';
import AgentLicenseModal from './AgentLicenseModal';
import { switchRole } from '../../services/apiService';

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

const RoleSelector: React.FC<{
    selectedRole: UserRole;
    onChange: (role: UserRole) => void;
}> = ({ selectedRole, onChange }) => {
    const roles: { id: UserRole, label: string }[] = [
        { id: UserRole.BUYER, label: 'Buyer' },
        { id: UserRole.PRIVATE_SELLER, label: 'Private Seller' },
        { id: UserRole.AGENT, label: 'Agent' }
    ];

    return (
        <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-full border border-neutral-200">
            {roles.map(role => (
                <button
                    key={role.id}
                    type="button"
                    onClick={() => onChange(role.id)}
                    className={`px-2.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 flex-grow text-center ${
                        selectedRole === role.id
                        ? 'bg-white text-primary shadow'
                        : 'text-neutral-600 hover:bg-neutral-200'
                    }`}
                >
                    {role.label}
                </button>
            ))}
        </div>
    );
};


const ProfileSettings: React.FC<{ user: User }> = ({ user }) => {
    const { updateUser, dispatch } = useAppContext();
    const [formData, setFormData] = useState<User>(user);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
    const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        setFormData(user);
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleRoleChange = async (role: UserRole) => {
        setError('');

        // If switching to agent and user is not already a verified agent, show license modal
        if (role === UserRole.AGENT && !user.licenseVerified) {
            setPendingRole(role);
            setIsLicenseModalOpen(true);
            return;
        }

        // For other role changes (or if already verified agent), switch directly
        try {
            setIsSaving(true);
            const updatedUser = await switchRole(role);
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            setFormData(updatedUser);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to switch role');
            console.error('Failed to switch role:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLicenseSubmit = async (licenseData: { licenseNumber: string; agencyName: string; agentId?: string }) => {
        if (!pendingRole) return;

        setIsSaving(true);
        try {
            const updatedUser = await switchRole(pendingRole, licenseData);
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            setFormData(updatedUser);
            setIsLicenseModalOpen(false);
            setPendingRole(null);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err: any) {
            throw err; // Let the modal handle the error
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateUser(formData);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error("Failed to update user", error);
        } finally {
            setIsSaving(false);
        }
    };

    const floatingInputClasses = "block px-2.5 pb-2.5 pt-4 w-full text-base text-neutral-900 bg-white rounded-lg border border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer";
    const floatingLabelClasses = "absolute text-base text-neutral-700 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1";

    return (
        <>
            <AgentLicenseModal
                isOpen={isLicenseModalOpen}
                onClose={() => {
                    setIsLicenseModalOpen(false);
                    setPendingRole(null);
                }}
                onSubmit={handleLicenseSubmit}
            />

            <form onSubmit={handleSaveChanges} className="space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-2">Profile Settings</h3>
                    <p className="text-sm text-neutral-500">Manage your personal information and account type.</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {error}
                    </div>
                )}

                <fieldset>
                    <legend className="block text-sm font-medium text-neutral-700 mb-2">Your Role</legend>
                    <RoleSelector selectedRole={formData.role} onChange={handleRoleChange} />
                    {formData.listingsCount !== undefined && (
                        <p className="text-xs text-neutral-500 mt-2">
                            Active listings: {formData.listingsCount} {!formData.isSubscribed && `(${5 - (formData.listingsCount || 0)} free listings remaining)`}
                        </p>
                    )}
                </fieldset>

            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <legend className="sr-only">Personal Information</legend>
                <div className="relative">
                    <input type="text" id="name" value={formData.name} onChange={handleInputChange} className={floatingInputClasses} placeholder=" " />
                    <label htmlFor="name" className={floatingLabelClasses}>Full Name</label>
                </div>
                <div className="relative">
                    <input type="email" id="email" value={formData.email} onChange={handleInputChange} className={floatingInputClasses} placeholder=" " />
                    <label htmlFor="email" className={floatingLabelClasses}>Email</label>
                </div>
                <div className="relative md:col-span-2">
                    <input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} className={floatingInputClasses} placeholder=" " />
                    <label htmlFor="phone" className={floatingLabelClasses}>Phone</label>
                </div>
            </fieldset>

            {formData.role === UserRole.AGENT && (
                <fieldset className="space-y-6 animate-fade-in border-t pt-8">
                     <legend className="text-lg font-semibold text-neutral-700 -mt-2 mb-4">Agent Information</legend>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <input type="text" id="agencyName" value={formData.agencyName || ''} onChange={handleInputChange} className={floatingInputClasses} placeholder=" " />
                            <label htmlFor="agencyName" className={floatingLabelClasses}>Agency Name</label>
                        </div>
                        <div className="relative">
                            <input type="text" id="agentId" value={formData.agentId || ''} onChange={handleInputChange} className={floatingInputClasses} placeholder=" " />
                            <label htmlFor="agentId" className={floatingLabelClasses}>Agent ID</label>
                        </div>
                        <div className="relative md:col-span-2">
                            <input type="text" id="licenseNumber" value={formData.licenseNumber || ''} onChange={handleInputChange} className={floatingInputClasses} placeholder=" " />
                            <label htmlFor="licenseNumber" className={floatingLabelClasses}>License Number (optional)</label>
                        </div>
                    </div>
                </fieldset>
            )}

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-dark transition-colors w-36 disabled:opacity-50">
                    {isSaving ? 'Saving...' : (isSaved ? 'Saved!' : 'Save Changes')}
                </button>
            </div>
        </form>
        </>
    );
};

const MyAccountPage: React.FC = () => {
    const { state, dispatch, logout } = useAppContext();
    const [activeTab, setActiveTab] = useState<AccountTab>('listings');

    if (!state.currentUser) {
        return (
            <div className="p-8 text-center">
                <p>You must be logged in to view this page.</p>
            </div>
        );
    }
    
    const isSellerProfile = state.currentUser.role === UserRole.AGENT || state.currentUser.role === UserRole.PRIVATE_SELLER;

    useEffect(() => {
        if (!isSellerProfile && (activeTab === 'listings' || activeTab === 'performance')) {
            setActiveTab('profile');
        }
    }, [isSellerProfile, activeTab]);
    
    const handleLogout = () => {
        logout();
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
    };

    const roleDisplayMap: Record<UserRole, string> = {
        [UserRole.AGENT]: 'Agent',
        [UserRole.PRIVATE_SELLER]: 'Private Seller',
        [UserRole.BUYER]: 'Buyer',
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'listings':
                return isSellerProfile ? <MyListings sellerId={state.currentUser!.id} /> : null;
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
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-4 rounded-xl shadow-md border border-neutral-200">
                             <div className="flex flex-col items-center text-center pb-4 mb-4 border-b">
                                {state.currentUser.avatarUrl ? (
                                    <img src={state.currentUser.avatarUrl} alt="avatar" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mb-3" />
                                ) : (
                                    <UserCircleIcon className="w-20 h-20 sm:w-24 sm:h-24 text-neutral-300 mb-3" />
                                )}
                                <h2 className="font-bold text-lg sm:text-xl text-neutral-800">{state.currentUser.name}</h2>
                                <p className="text-sm text-neutral-500 capitalize">{roleDisplayMap[state.currentUser.role]}</p>
                            </div>
                            <nav className="space-y-2">
                                {isSellerProfile && (
                                    <>
                                        <TabButton label="My Listings" icon={<BuildingOfficeIcon className="w-6 h-6"/>} isActive={activeTab === 'listings'} onClick={() => setActiveTab('listings')} />
                                        <TabButton label="Performance" icon={<ChartBarIcon className="w-6 h-6"/>} isActive={activeTab === 'performance'} onClick={() => setActiveTab('performance')} />
                                    </>
                                )}
                                <TabButton label="Profile Settings" icon={<UserCircleIcon className="w-6 h-6"/>} isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors w-full text-left text-red-600 hover:bg-red-50 mt-4">
                                    <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                                    <span>Logout</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
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