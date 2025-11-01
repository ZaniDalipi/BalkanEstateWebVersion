import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { AppView, UserRole } from '../../types';
import { LogoIcon, SearchIcon, MagnifyingGlassPlusIcon, HeartIcon, EnvelopeIcon, UserCircleIcon, UsersIcon, ArrowLeftOnRectangleIcon, XMarkIcon } from '../../constants';

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
    const { state, dispatch } = useAppContext();
    const { activeView, isAuthenticated, currentUser, userRole } = state;

    const handleNavClick = (view: AppView) => {
        if ((view === 'inbox' || view === 'account' || view === 'saved-searches' || view === 'saved-homes') && !isAuthenticated) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
            return;
        }
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
        onClose(); // Close sidebar on mobile after navigation
    };

    const handleLogout = () => {
        dispatch({ type: 'SET_AUTH_STATE', payload: { isAuthenticated: false, user: null } });
        dispatch({ type: 'SET_USER_ROLE', payload: UserRole.BUYER });
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
        onClose();
    };

    const buyerNavItems = [
      { view: 'search' as AppView, label: 'Search', icon: <SearchIcon /> },
      { view: 'saved-searches' as AppView, label: 'Saved Searches', icon: <MagnifyingGlassPlusIcon /> },
      { view: 'saved-homes' as AppView, label: 'Saved Homes', icon: <HeartIcon /> },
      { view: 'agents' as AppView, label: 'Agents', icon: <UsersIcon /> },
      { view: 'inbox' as AppView, label: 'Inbox', icon: <EnvelopeIcon /> },
    ];
    
    const sellerNavItems = [
       { view: 'search' as AppView, label: 'Dashboard', icon: <SearchIcon /> },
       { view: 'agents' as AppView, label: 'Agents', icon: <UsersIcon /> },
       { view: 'inbox' as AppView, label: 'Inbox', icon: <EnvelopeIcon /> },
    ];
    
    const navItems = userRole === UserRole.SELLER ? sellerNavItems : buyerNavItems;

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 bg-black/60 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full bg-white border-r border-neutral-200 z-40 flex flex-col transition-all duration-300 ease-in-out group overflow-hidden ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} md:w-20 md:translate-x-0 hover:md:w-64`}>
                <div className="flex items-center p-4 h-[69px] border-b border-neutral-200 flex-shrink-0 md:justify-center group-hover:md:justify-start">
                    <div className="flex items-center space-x-2">
                        <LogoIcon className="w-8 h-8 text-primary flex-shrink-0" />
                        <h1 className="text-xl font-bold text-neutral-800 md:hidden group-hover:md:inline whitespace-nowrap">
                            Balkan <span className="text-primary">Estate</span>
                        </h1>
                    </div>
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
                         <button onClick={() => { dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true }); onClose(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors w-full text-left text-neutral-700 hover:bg-neutral-100 md:justify-center group-hover:md:justify-start">
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