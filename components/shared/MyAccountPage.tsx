import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import MyListings from './MyListings';
import SubscriptionManagement from './SubscriptionManagement';
import ProfileStatistics from './ProfileStatistics';
import { User, UserRole, Agency } from '../../types';
import { BuildingOfficeIcon, ChartBarIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, XMarkIcon, MapPinIcon } from '../../constants';
import AgentLicenseModal from './AgentLicenseModal';
import AgencyManagementSection from './AgencyManagementSection';
import { switchRole, joinAgencyByInvitationCode, getAgencies, updateAgentProfile } from '../../services/apiService';
import Footer from './Footer';
import { BALKAN_LOCATIONS } from '../../utils/balkanLocations';
import MapLocationPicker from '../SellerFlow/MapLocationPicker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Common languages spoken in the Balkan region
const BALKAN_LANGUAGES = [
  'English', 'Serbian', 'Croatian', 'Slovenian', 'Bosnian', 'Macedonian',
  'Albanian', 'Montenegrin', 'Bulgarian', 'Romanian', 'Greek', 'Turkish',
  'Hungarian', 'German', 'Italian', 'French', 'Russian', 'Spanish'
];

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
    originalRole: UserRole;
    onChange: (role: UserRole) => void;
}> = ({ selectedRole, originalRole, onChange }) => {
    const roles: { id: UserRole, label: string }[] = [
        { id: UserRole.BUYER, label: 'Buyer' },
        { id: UserRole.PRIVATE_SELLER, label: 'Private Seller' },
        { id: UserRole.AGENT, label: 'Agent' }
    ];

    // Agents cannot switch to buyer
    const isDisabled = (role: UserRole) => {
        if (originalRole === UserRole.AGENT && role === UserRole.BUYER) {
            return true;
        }
        return false;
    };

    return (
        <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-full border border-neutral-200">
            {roles.map(role => (
                <button
                    key={role.id}
                    type="button"
                    onClick={() => !isDisabled(role.id) && onChange(role.id)} 
                    disabled={isDisabled(role.id)} 
                    className={`px-2.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 flex-grow text-center ${
                        selectedRole === role.id
                        ? 'bg-white text-primary shadow'
                        : isDisabled(role.id) 
                        ? 'text-neutral-400 cursor-not-allowed opacity-50'
                        : 'text-neutral-600 hover:bg-neutral-200'
                    }`
                }
                    title={isDisabled(role.id) ? 'Agents cannot switch to Buyer role' : ''} 
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
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [invitationCode, setInvitationCode] = useState('');
    const [isJoiningAgency, setIsJoiningAgency] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [agentData, setAgentData] = useState({
        languages: user.languages || ['English'],
        specializations: user.specializations?.join(', ') || '',
        serviceAreas: user.serviceAreas || [],
        city: user.city || '',
        country: user.country || '',
        streetAddress: '',
        lat: user.lat || 0,
        lng: user.lng || 0,
    });

    const handleAgencyClick = async () => {
        if (formData?.agencyId) {
            try {
                const response = await fetch(`${API_URL}/agencies/${formData.agencyId}`);
                if (response.ok) {
                    const data = await response.json();
                    dispatch({ type: 'SET_SELECTED_AGENCY', payload: data.agency });
                    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencyDetail' });
                }
            } catch (error) {
                // Failed to fetch agency details
            }
        }
    };

    useEffect(() => {
        setFormData(user);
        setAgentData({
            languages: user.languages || ['English'],
            specializations: user.specializations?.join(', ') || '',
            serviceAreas: user.serviceAreas || [],
            city: user.city || '',
            country: user.country || '',
            streetAddress: '',
            lat: user.lat || 0,
            lng: user.lng || 0,
        });
    }, [user]);

    // Fetch agencies when component mounts or when user is an agent
    useEffect(() => {
        const fetchAgencies = async () => {
            if (formData.role === UserRole.AGENT) {
                try {
                    const response = await getAgencies();
                    setAgencies(response.agencies || []);
                } catch (error) {
                    setAgencies([]);
                }
            }
        };
        fetchAgencies();
    }, [formData.role]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleRoleChange = async (role: UserRole) => {
        setError('');

        // If switching to agent and never been an agent before, require license verification
        if (role === UserRole.AGENT && !user.licenseNumber) {
            setPendingRole(role);
            setIsLicenseModalOpen(true);
            return;
        }

        // For other role switches (including agent ↔ private_seller), allow freely
        try {
            setIsSaving(true);
            const updatedUser = await switchRole(role);
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            setFormData(updatedUser);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to switch role');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLicenseSubmit = async (licenseData: { licenseNumber: string; agencyInvitationCode?: string; agentId?: string; selectedAgencyId?: string; languages?: string[] }) => {
        setIsSaving(true);
        setError('');
        try {
            const roleToSwitch = pendingRole || formData.role;
            console.log('🔄 Switching to role:', roleToSwitch);
            const updatedUser = await switchRole(roleToSwitch, licenseData);
            console.log('✅ Role switch successful');

            // Update context and form data
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            setFormData(updatedUser);

            // Close modal and show success
            setIsLicenseModalOpen(false);
            setPendingRole(null);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err) {
            console.error('❌ Role switch failed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to switch role';
            setError(errorMessage);
            // Re-throw so modal can catch and display error
            throw err;
        } finally {
            setIsSaving(false);
        }
    };

    const handleLanguageToggle = (language: string) => {
        setAgentData(prev => ({
            ...prev,
            languages: prev.languages.includes(language)
                ? prev.languages.filter(l => l !== language)
                : [...prev.languages, language]
        }));
    };

    const handleAddServiceArea = (locationName: string) => {
        if (!agentData.serviceAreas.includes(locationName)) {
            setAgentData(prev => ({
                ...prev,
                serviceAreas: [...prev.serviceAreas, locationName]
            }));
        }
    };

    const handleRemoveServiceArea = (locationName: string) => {
        setAgentData(prev => ({
            ...prev,
            serviceAreas: prev.serviceAreas.filter(area => area !== locationName)
        }));
    };

    const handleSetMainLocation = (city: string, country: string) => {
        setAgentData(prev => ({
            ...prev,
            city,
            country
        }));
    };

    const handleLocationChange = (lat: number, lng: number) => {
        setAgentData(prev => ({
            ...prev,
            lat,
            lng
        }));
    };

    const handleAddressChange = (address: string) => {
        setAgentData(prev => ({
            ...prev,
            streetAddress: address
        }));
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Prepare the data to be saved
            const parsedSpecializations = agentData.specializations
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            // Basic user data for updateUser
            const basicUserData = {
                name: formData.name,
                phone: formData.phone,
                city: agentData.city,
                country: agentData.country,
                avatarUrl: formData.avatarUrl,
            };

            // Update UI immediately (optimistic update)
            const optimisticData = {
                ...formData,
                languages: agentData.languages,
                specializations: parsedSpecializations,
                serviceAreas: agentData.serviceAreas,
                city: agentData.city,
                country: agentData.country,
                lat: agentData.lat,
                lng: agentData.lng,
            };
            setFormData(optimisticData);

            // Update basic user profile
            const savedUser = await updateUser(basicUserData);

            // If agent, also update agent-specific fields
            let finalUser = {
                ...savedUser,
                languages: agentData.languages,
                specializations: parsedSpecializations,
                serviceAreas: agentData.serviceAreas,
                lat: agentData.lat,
                lng: agentData.lng,
            };

            if (formData.role === UserRole.AGENT) {
                const agentProfileData = {
                    languages: agentData.languages,
                    specializations: parsedSpecializations,
                    serviceAreas: agentData.serviceAreas,
                    lat: agentData.lat,
                    lng: agentData.lng,
                };

                try {
                    const updatedAgent = await updateAgentProfile(agentProfileData);
                    // Merge agent data with user data
                    finalUser = {
                        ...savedUser,
                        languages: updatedAgent.languages || agentData.languages,
                        specializations: updatedAgent.specializations || parsedSpecializations,
                        serviceAreas: updatedAgent.serviceAreas || agentData.serviceAreas,
                        lat: updatedAgent.lat !== undefined ? updatedAgent.lat : agentData.lat,
                        lng: updatedAgent.lng !== undefined ? updatedAgent.lng : agentData.lng,
                    };
                } catch (agentError) {
                    console.error('Error updating agent profile:', agentError);
                    // Continue with user data even if agent update fails
                }
            }

            // Sync with server response to ensure consistency
            setFormData(finalUser);
            setAgentData(prev => ({
                ...prev,
                languages: finalUser.languages || ['English'],
                specializations: finalUser.specializations?.join(', ') || '',
                serviceAreas: finalUser.serviceAreas || [],
                city: finalUser.city || '',
                country: finalUser.country || '',
                lat: finalUser.lat || prev.lat,
                lng: finalUser.lng || prev.lng,
            }));

            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error('Error saving changes:', error);
            // Revert to previous state on error
            setFormData(user);
            setAgentData({
                languages: user.languages || ['English'],
                specializations: user.specializations?.join(', ') || '',
                serviceAreas: user.serviceAreas || [],
                city: user.city || '',
                country: user.country || '',
                streetAddress: '',
                lat: user.lat || 0,
                lng: user.lng || 0,
            });
            setError('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleJoinByInvitationCode = async () => {
        if (!invitationCode.trim()) {
            setError('Please enter an invitation code');
            return;
        }

        setIsJoiningAgency(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/agencies/join-by-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('balkan_estate_token')}`,
                },
                body: JSON.stringify({ invitationCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to join agency');
            }

            // Update user in context with new agency info
            if (data.user) {
                dispatch({ type: 'UPDATE_USER', payload: data.user });
                setFormData(prev => ({
                    ...prev,
                    agencyName: data.user.agencyName,
                    agencyId: data.user.agencyId,
                }));
            }

            setIsSaved(true);
            setInvitationCode('');
            setError('');
            alert(`✅ Successfully joined ${data.agency.name}!`);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to join agency');
        } finally {
            setIsJoiningAgency(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setIsUploadingAvatar(true);
        setError('');

        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch(`${API_URL}/auth/upload-avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('balkan_estate_token')}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload avatar');
            }

            dispatch({ type: 'UPDATE_USER', payload: data.user });
            setFormData(data.user);
            setIsSaved(true);
            setTimeout(() => {
                setIsSaved(false);
                setAvatarPreview(null);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload avatar');
            setAvatarPreview(null);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const floatingInputClasses = "block px-2.5 pb-2.5 pt-4 w-full text-base text-neutral-900 bg-white rounded-lg border border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer";
    const floatingLabelClasses = "absolute text-base text-neutral-700 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1";

    return (
        <>
            <form onSubmit={handleSaveChanges}>
                <fieldset>
                    <legend className="block text-sm font-medium text-neutral-700 mb-2">Your Role</legend>
                    <RoleSelector selectedRole={formData.role} originalRole={user.role} onChange={handleRoleChange} />
                    {error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {error}
                        </div>
                    )}
                </fieldset>

            {/* Avatar Upload Section */}
            <fieldset className="border-t pt-6">
                <legend className="block text-sm font-medium text-neutral-700 mb-4">Profile Picture</legend>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        {avatarPreview || formData.avatarUrl ? (
                            <img
                                src={avatarPreview || formData.avatarUrl}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover border-4 border-neutral-200"
                            />
                        ) : (
                            <UserCircleIcon className="w-24 h-24 text-neutral-300" />
                        )}
                        {isUploadingAvatar && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={isUploadingAvatar}
                            className="hidden"
                        />
                        <label
                            htmlFor="avatar-upload"
                            className={`inline-block px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-dark transition-colors cursor-pointer ${
                                isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isUploadingAvatar ? 'Uploading...' : 'Change Picture'}
                        </label>
                        <p className="text-xs text-neutral-500 mt-2">
                            JPG, PNG or GIF. Max size 5MB.
                        </p>
                    </div>
                </div>
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
                     <div className="flex items-center justify-between -mt-2 mb-4">
                        <legend className="text-lg font-semibold text-neutral-700">Agent Information</legend>
                        {formData.licenseVerified && (
                            <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full font-medium">
                                ✓ License Verified
                            </span>
                        )}
                     </div>

                     {/* Agency Management - Always visible for agents */}
                     <AgencyManagementSection
                        currentUser={formData}
                        onAgencyChange={async () => {
                           // Fetch updated user data instead of reloading the page
                           try {
                              const response = await fetch(`${API_URL}/auth/me`, {
                                 headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('balkan_estate_token')}`,
                                 },
                              });
                              if (response.ok) {
                                 const data = await response.json();
                                 dispatch({ type: 'UPDATE_USER', payload: data.user });
                                 setFormData(data.user);
                              }
                           } catch (err) {
                              console.error('Failed to refresh user data:', err);
                           }
                        }}
                     />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    id="agencyName"
                                    value={formData.agencyName || 'Independent Agent'}
                                    className={floatingInputClasses}
                                    placeholder=" "
                                    disabled
                                    title="Agency affiliation can only be changed using an invitation code"
                                />
                                <label htmlFor="agencyName" className={floatingLabelClasses}>Agency Name</label>
                            </div>

                            {/* View Agency Button */}
                            {formData.agencyId && (
                                <button
                                    type="button"
                                    onClick={handleAgencyClick}
                                    className="mt-2 text-sm text-primary hover:text-primary-dark font-semibold flex items-center gap-1"
                                >
                                    <BuildingOfficeIcon className="w-4 h-4" />
                                    View Agency Details →
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                id="agentId"
                                value={formData.agentId || ''}
                                className={floatingInputClasses}
                                placeholder=" "
                                disabled
                                title="Agent ID is automatically generated and cannot be changed"
                            />
                            <label htmlFor="agentId" className={floatingLabelClasses}>Agent ID</label>
                        </div>
                        <div className="relative md:col-span-2">
                            <input
                                type="text"
                                id="licenseNumber"
                                value={formData.licenseNumber || ''}
                                className={floatingInputClasses}
                                placeholder=" "
                                disabled
                                title="License number can only be set during agent verification"
                            />
                            <label htmlFor="licenseNumber" className={floatingLabelClasses}>License Number</label>
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-neutral-700">Languages Spoken</label>
                        <div className="flex flex-wrap gap-2">
                            {BALKAN_LANGUAGES.map((language) => (
                                <button
                                    key={language}
                                    type="button"
                                    onClick={() => handleLanguageToggle(language)}
                                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                                        agentData.languages.includes(language)
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary'
                                    }`}
                                >
                                    {language}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Specializations */}
                    <div>
                        <label htmlFor="specializations" className="block text-sm font-medium text-neutral-700 mb-2">Specializations</label>
                        <textarea
                            id="specializations"
                            value={agentData.specializations}
                            onChange={(e) => setAgentData(prev => ({ ...prev, specializations: e.target.value }))}
                            placeholder="e.g., Residential, Commercial, Luxury Properties, Investment Properties"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            rows={2}
                        />
                        <p className="text-xs text-neutral-500 mt-1">Enter comma-separated specializations</p>
                    </div>

                    {/* Main Location with Map Picker */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-3">Main Office Location</label>
                        <p className="text-xs text-neutral-600 mb-3">Search for your office location or drag the marker on the map to set your exact address</p>

                        {/* Map Location Picker */}
                        <div className="border border-neutral-300 rounded-lg overflow-hidden mb-3 h-96">
                            <MapLocationPicker
                                lat={agentData.lat || 42.0}
                                lng={agentData.lng || 21.0}
                                address={agentData.streetAddress || agentData.city || 'Select location'}
                                country={agentData.country || 'Serbia'}
                                city={agentData.city || ''}
                                cityLat={agentData.lat || 42.0}
                                cityLng={agentData.lng || 21.0}
                                onLocationChange={handleLocationChange}
                                onAddressChange={handleAddressChange}
                                zoom={10}
                            />
                        </div>

                        {/* Location Display */}
                        {agentData.streetAddress && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-neutral-700">
                                    <MapPinIcon className="w-4 h-4 inline mr-2 text-primary" />
                                    Selected Address
                                </p>
                                <p className="text-sm text-neutral-600 mt-1">{agentData.streetAddress}</p>
                                <p className="text-xs text-neutral-500 mt-1">
                                    Coordinates: {agentData.lat.toFixed(6)}, {agentData.lng.toFixed(6)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Service Areas */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-neutral-700">Service Areas</label>
                            {agentData.serviceAreas.length > 0 && (
                                <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                                    {agentData.serviceAreas.length} area{agentData.serviceAreas.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {/* Service Areas List */}
                        {agentData.serviceAreas.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                {agentData.serviceAreas.map((area) => (
                                    <div key={area} className="flex items-center gap-2 bg-primary-light px-3 py-1.5 rounded-full">
                                        <span className="text-sm font-medium text-neutral-700">{area}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveServiceArea(area)}
                                            className="text-neutral-500 hover:text-red-500 transition-colors"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Service Area */}
                        <select
                            defaultValue=""
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleAddServiceArea(e.target.value);
                                    e.target.value = '';
                                }
                            }}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        >
                            <option value="">Add service area...</option>
                            {BALKAN_LOCATIONS.map((location) => (
                                <option
                                    key={`${location.name}-${location.country}`}
                                    value={location.name}
                                    disabled={agentData.serviceAreas.includes(location.name)}
                                >
                                    {location.name} {location.country}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-neutral-500 mt-1">Add cities and countries where you operate</p>
                    </div>
                </fieldset>
            )}

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-dark transition-colors w-36 disabled:opacity-50">
                    {isSaving ? 'Saving...' : (isSaved ? 'Saved!' : 'Save Changes')}
                </button>
            </div>
        </form>

        <AgentLicenseModal
            isOpen={isLicenseModalOpen}
            onClose={() => {
                setIsLicenseModalOpen(false);
                setPendingRole(null);
            }}
            onSubmit={handleLicenseSubmit}
            currentLicenseNumber={user.licenseNumber}
            currentAgentId={user.agentId}
        />
        </>
    );
};

const MyAccountPage: React.FC = () => {
    const { state, dispatch, logout } = useAppContext();
    const [activeTab, setActiveTab] = useState<AccountTab>('listings');
    const [performanceRefreshKey, setPerformanceRefreshKey] = useState(0);

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

    useEffect(() => {
        if (activeTab === 'performance') {
            setPerformanceRefreshKey(prev => prev + 1);
        }
    }, [activeTab]);

    const handleLogout = () => {
        logout();
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
    };

    const handleAgencyClick = async () => {
        if (state.currentUser?.agencyId) {
            try {
                // Fetch the agency details
                const response = await fetch(`${API_URL}/agencies/${state.currentUser.agencyId}`);
                if (response.ok) {
                    const data = await response.json();
                    dispatch({ type: 'SET_SELECTED_AGENCY', payload: data.agency });
                    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencyDetail' });
                }
            } catch (error) {
                // Silent error handling
            }
        }
    };

    const roleDisplayMap: Record<UserRole, string> = {
        [UserRole.AGENT]: 'Agent',
        [UserRole.PRIVATE_SELLER]: 'Private Seller',
        [UserRole.BUYER]: 'Buyer',
        [UserRole.ADMIN]: '',
        [UserRole.SUPER_ADMIN]: ''
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'listings':
                return isSellerProfile ? <MyListings sellerId={state.currentUser!.id} /> : null;
            case 'profile':
                return <ProfileSettings user={state.currentUser!} />;
            case 'performance':
                 return <ProfileStatistics key={performanceRefreshKey} user={state.currentUser!} />;
            case 'subscription':
                 return <SubscriptionManagement userId={state.currentUser!.id} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-neutral-50 min-h-screen flex flex-col">
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-grow">
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
                                <p className="text-sm text-neutral-500 capitalize mb-2">{roleDisplayMap[state.currentUser.role]}</p>

                                {/* Agency Badge */}
                                {state.currentUser.role === UserRole.AGENT && state.currentUser.agencyName && (
                                    <button
                                        onClick={handleAgencyClick}
                                        className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-primary-light rounded-full border border-primary/20 hover:from-blue-100 hover:to-primary-light/80 transition-all cursor-pointer"
                                        title="View agency details"
                                    >
                                        <BuildingOfficeIcon className="w-4 h-4 text-primary" />
                                        <span className="text-xs font-semibold text-primary">{state.currentUser.agencyName}</span>
                                    </button>
                                )}

                                {/* License Verified Badge */}
                                {state.currentUser.role === UserRole.AGENT && state.currentUser.licenseVerified && (
                                    <div className="flex items-center gap-1 mt-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
                                        <span className="text-xs font-semibold text-green-700">✓ Verified Agent</span>
                                    </div>
                                )}
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

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default MyAccountPage;