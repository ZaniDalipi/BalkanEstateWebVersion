import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { AppView, UserRole } from '../../types';
import { LogoIcon, SearchIcon, MagnifyingGlassPlusIcon, HeartIcon, EnvelopeIcon, UserCircleIcon, UsersIcon, ArrowLeftOnRectangleIcon, XMarkIcon, PencilIcon, StarIconSolid, BuildingOfficeIcon } from '../../constants';

const NavItem: React.FC<{
  view: AppView;
  label: string;
  icon: React.ReactNode;
  activeView: AppView;
  onClick: (view: AppView) => void;
}> = ({ view, label, icon, activeView, onClick }) => {
  const isActive = view === activeView;
  return (
    <button
      onClick={() => onClick(view)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors w-full text-left md:justify-center group-hover:md:justify-start ${
        isActive
          ? 'bg-primary-light text-primary-dark'
          : 'text-neutral-700 hover:bg-neutral-100'
      }`}
    >
      <div className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-primary' : 'text-neutral-700'}`}>{icon}</div>
      <span className="md:hidden group-hover:md:inline whitespace-nowrap">{label}</span>
    </button>
  );
};

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { state, dispatch, logout } = useAppContext();
    const { activeView, isAuthenticated, currentUser } = state;

    const handleNavClick = (view: AppView) => {
        const needsAuth = ['inbox', 'account', 'saved-searches', 'saved-properties'].includes(view);
        if (needsAuth && !isAuthenticated) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } });
        } else {
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
        }
        onClose(); // Close sidebar on mobile after navigation
    };

    const handleNewListingClick = () => {
        if (isAuthenticated) {
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'create-listing' });
        } else {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'signup' } });
        }
        onClose();
    };

    const handleSubscriptionClick = () => {
        dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: true });
        onClose();
    };

    const handleLogout = () => {
        logout();
        // After logout, reset to a default public view
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
        onClose();
    };

    const navItems = [
      { view: 'search' as AppView, label: 'Search', icon: <SearchIcon /> },
      { view: 'saved-searches' as AppView, label: 'Saved Searches', icon: <MagnifyingGlassPlusIcon /> },
      { view: 'saved-properties' as AppView, label: 'Saved Properties', icon: <HeartIcon /> },
      { view: 'inbox' as AppView, label: 'Inbox', icon: <EnvelopeIcon /> },
      { view: 'agents' as AppView, label: 'Top Agents', icon: <UsersIcon /> },
      { view: 'agencies' as AppView, label: 'Agencies', icon: <BuildingOfficeIcon /> },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full bg-white border-r border-neutral-200 z-40 flex flex-col transition-all duration-300 ease-in-out group overflow-hidden ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} md:w-20 md:translate-x-0 hover:md:w-64`}>
                <div className="flex items-center p-4 h-[69px] border-b border-neutral-200 flex-shrink-0 md:justify-center group-hover:md:justify-start">
                    <button
                        onClick={() => handleNavClick('search')}
                        className="flex items-center space-x-2"
                    >
                        <LogoIcon className="w-8 h-8 text-primary flex-shrink-0" />
                        <h1 className="text-xl font-bold text-neutral-800 md:hidden group-hover:md:inline whitespace-nowrap">
                            Balkan <span className="text-primary">Estate</span>
                        </h1>
                    </button>
                    <button onClick={onClose} className="md:hidden absolute right-4 top-5 text-neutral-700 hover:text-neutral-800">
                        <XMarkIcon className="w-6 h-6"/>
                    </button>
                </div>
                
                <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                         <NavItem
                            key={item.view}
                            view={item.view}
                            label={item.label}
                            icon={item.icon}
                            activeView={activeView}
                            onClick={handleNavClick}
                        />
                    ))}
                     <div className="px-2 pt-2 mt-2 border-t border-neutral-100 space-y-1">
                        <button
                            onClick={handleNewListingClick}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors w-full text-white bg-secondary hover:bg-opacity-90 md:justify-center group-hover:md:justify-start"
                        >
                            <PencilIcon className="w-6 h-6 flex-shrink-0" />
                            <span className="md:hidden group-hover:md:inline whitespace-nowrap">+ New Listing</span>
                        </button>
                        <button
                            onClick={handleSubscriptionClick}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors w-full text-left md:justify-center group-hover:md:justify-start text-neutral-700 hover:bg-neutral-100`}
                        >
                            <div className={`w-6 h-6 flex-shrink-0 text-neutral-700`}><StarIconSolid /></div>
                            <span className="md:hidden group-hover:md:inline whitespace-nowrap">Subscription</span>
                        </button>
                    </div>
                </nav>

                <div className="p-2 border-t border-neutral-200 flex-shrink-0">
                    {isAuthenticated && currentUser ? (
                        <div className="space-y-1">
                             <button
                                onClick={() => handleNavClick('account')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors w-full text-left md:justify-center group-hover:md:justify-start ${
                                    activeView === 'account'
                                    ? 'bg-primary-light text-primary-dark'
                                    : 'text-neutral-700 hover:bg-neutral-100'
                                }`}
                            >
                                <div className="w-6 h-6 flex-shrink-0">
                                {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover"/> : <UserCircleIcon />}
                                </div>
                                <span className="md:hidden group-hover:md:inline whitespace-nowrap">My Account</span>
                            </button>
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors w-full text-left text-red-600 hover:bg-red-50 md:justify-center group-hover:md:justify-start">
                                <ArrowLeftOnRectangleIcon className="w-6 h-6 flex-shrink-0" />
                                <span className="md:hidden group-hover:md:inline whitespace-nowrap">Logout</span>
                            </button>
                        </div>
                    ) : (
                         <button onClick={() => { dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'login' } }); onClose(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors w-full text-left text-neutral-700 hover:bg-neutral-100 md:justify-center group-hover:md:justify-start">
                            <UserCircleIcon className="w-6 h-6 text-neutral-700 flex-shrink-0" />
                            <span className="md:hidden group-hover:md:inline whitespace-nowrap">Login / Register</span>
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;