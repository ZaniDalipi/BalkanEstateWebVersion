import React from 'react';
import { User, UserRole } from '../../types';

interface RoleSelectorProps {
    currentUser: User;
    selectedRole: UserRole;
    onRoleSelect: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ currentUser, selectedRole, onRoleSelect }) => {
    const availableRoles = currentUser.availableRoles || [currentUser.role];

    // Check if user has both agent and private_seller roles
    const hasPrivateSeller = availableRoles.includes(UserRole.PRIVATE_SELLER);
    const hasAgent = availableRoles.includes(UserRole.AGENT);

    // Only show role selector if user has multiple posting roles
    if (!hasPrivateSeller && !hasAgent) {
        return null;
    }

    if (availableRoles.length <= 1 && !availableRoles.includes(UserRole.AGENT) && !availableRoles.includes(UserRole.PRIVATE_SELLER)) {
        return null;
    }

    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case UserRole.AGENT:
                return '🏢';
            case UserRole.PRIVATE_SELLER:
                return '🏠';
            default:
                return '👤';
        }
    };

    const getRoleLabel = (role: UserRole) => {
        switch (role) {
            case UserRole.AGENT:
                return 'Agent';
            case UserRole.PRIVATE_SELLER:
                return 'Private Seller';
            default:
                return role;
        }
    };

    const getRoleSubscription = (role: UserRole) => {
        if (role === UserRole.PRIVATE_SELLER && currentUser.privateSellerSubscription) {
            const sub = currentUser.privateSellerSubscription;
            return {
                plan: sub.plan,
                limit: sub.listingsLimit,
                used: sub.activeListingsCount,
                isActive: sub.isActive,
            };
        }

        if (role === UserRole.AGENT && currentUser.agentSubscription) {
            const sub = currentUser.agentSubscription;
            return {
                plan: sub.plan,
                limit: sub.listingsLimit,
                used: sub.activeListingsCount,
                isActive: sub.isActive,
                isTrial: sub.plan === 'trial',
            };
        }

        return null;
    };

    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'trial':
                return <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Trial</span>;
            case 'pro_monthly':
            case 'pro_yearly':
                return <span className="text-xs font-semibold px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded">Pro</span>;
            case 'free':
                return <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded">Free</span>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white border-2 border-primary/20 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-neutral-800">Post Listing As</h3>
                <div className="flex-1 h-px bg-neutral-200"></div>
            </div>

            <p className="text-sm text-neutral-600 mb-4">
                Choose which role to use when creating this listing. Each role has separate listing limits and subscriptions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hasPrivateSeller && (
                    <RoleCard
                        role={UserRole.PRIVATE_SELLER}
                        icon={getRoleIcon(UserRole.PRIVATE_SELLER)}
                        label={getRoleLabel(UserRole.PRIVATE_SELLER)}
                        subscription={getRoleSubscription(UserRole.PRIVATE_SELLER)}
                        isSelected={selectedRole === UserRole.PRIVATE_SELLER}
                        onSelect={() => onRoleSelect(UserRole.PRIVATE_SELLER)}
                        getPlanBadge={getPlanBadge}
                    />
                )}

                {hasAgent && (
                    <RoleCard
                        role={UserRole.AGENT}
                        icon={getRoleIcon(UserRole.AGENT)}
                        label={getRoleLabel(UserRole.AGENT)}
                        subscription={getRoleSubscription(UserRole.AGENT)}
                        isSelected={selectedRole === UserRole.AGENT}
                        onSelect={() => onRoleSelect(UserRole.AGENT)}
                        getPlanBadge={getPlanBadge}
                        agencyName={currentUser.agencyName}
                    />
                )}
            </div>
        </div>
    );
};

interface RoleCardProps {
    role: UserRole;
    icon: string;
    label: string;
    subscription: {
        plan: string;
        limit: number;
        used: number;
        isActive: boolean;
        isTrial?: boolean;
    } | null;
    isSelected: boolean;
    onSelect: () => void;
    getPlanBadge: (plan: string) => React.ReactNode;
    agencyName?: string;
}

const RoleCard: React.FC<RoleCardProps> = ({
    role,
    icon,
    label,
    subscription,
    isSelected,
    onSelect,
    getPlanBadge,
    agencyName
}) => {
    const remaining = subscription ? subscription.limit - subscription.used : 0;
    const isLimitReached = subscription ? subscription.used >= subscription.limit : false;

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={isLimitReached}
            className={`
                relative p-4 rounded-lg border-2 text-left transition-all duration-200
                ${isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-neutral-200 bg-white hover:border-primary/50 hover:shadow-sm'
                }
                ${isLimitReached ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            {isSelected && (
                <div className="absolute top-2 right-2">
                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                </div>
            )}

            <div className="flex items-start gap-3">
                <span className="text-3xl">{icon}</span>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-neutral-800">{label}</h4>
                        {subscription && getPlanBadge(subscription.plan)}
                    </div>

                    {agencyName && (
                        <p className="text-xs text-neutral-600 mb-2">{agencyName}</p>
                    )}

                    {subscription ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-600">Listings</span>
                                <span className={`font-semibold ${isLimitReached ? 'text-red-600' : 'text-neutral-800'}`}>
                                    {subscription.used} / {subscription.limit}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-neutral-200 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        isLimitReached
                                            ? 'bg-red-500'
                                            : remaining <= 2
                                                ? 'bg-amber-500'
                                                : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min((subscription.used / subscription.limit) * 100, 100)}%` }}
                                />
                            </div>

                            {isLimitReached ? (
                                <p className="text-xs text-red-600 font-medium mt-1">
                                    Listing limit reached. Upgrade to post more.
                                </p>
                            ) : remaining <= 2 ? (
                                <p className="text-xs text-amber-600 font-medium mt-1">
                                    {remaining} listing{remaining !== 1 ? 's' : ''} remaining
                                </p>
                            ) : (
                                <p className="text-xs text-green-600 font-medium mt-1">
                                    {remaining} listing{remaining !== 1 ? 's' : ''} available
                                </p>
                            )}

                            {subscription.isTrial && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                                    <strong>Trial Active:</strong> 7-day trial with {subscription.limit} listings
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-neutral-500">No subscription data</p>
                    )}
                </div>
            </div>
        </button>
    );
};

export default RoleSelector;
