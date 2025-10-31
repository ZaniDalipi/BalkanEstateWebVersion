import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { AppView } from '../../types';
import { BuildingLibraryIcon, EnvelopeIcon, HeartIcon, MagnifyingGlassPlusIcon, SearchIcon, UserCircleIcon } from '../../constants';

const NavItem: React.FC<{
  view: AppView;
  label: string;
  icon: React.ReactNode;
  activeView: AppView;
  onClick: (view: AppView) => void;
  isAccount?: boolean;
}> = ({ view, label, icon, activeView, onClick, isAccount }) => {
  const { state } = useAppContext();
  const isActive = view === activeView;
  
  let iconContent = icon;
  if (isAccount && state.isAuthenticated && state.currentUser?.avatarUrl) {
    iconContent = <img src={state.currentUser.avatarUrl} alt="My Account" className="w-6 h-6 rounded-full object-cover" />;
  }

  return (
    <button
      onClick={() => onClick(view)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        isActive ? 'text-primary' : 'text-neutral-500 hover:text-primary'
      }`}
    >
      <div className={`w-6 h-6 mb-1 flex items-center justify-center ${isActive ? 'text-primary' : ''}`}>{iconContent}</div>
      <span className={`text-xs font-bold ${isActive ? 'text-primary' : ''}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { activeView, isAuthenticated, userRole } = state;

  const handleNavClick = (view: AppView) => {
    if ((view === 'inbox' || view === 'account') && !isAuthenticated) {
        dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
        return;
    }
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  };
  
  const navItems = userRole === 'BUYER' ? 
  [
      { view: 'search' as AppView, label: 'Search', icon: <SearchIcon /> },
      { view: 'saved-homes' as AppView, label: 'Saved', icon: <HeartIcon /> },
      { view: 'inbox' as AppView, label: 'Inbox', icon: <EnvelopeIcon /> },
      { view: 'account' as AppView, label: 'Account', icon: <UserCircleIcon />, isAccount: true },
  ] : [
      { view: 'search' as AppView, label: 'Dashboard', icon: <SearchIcon /> },
      { view: 'inbox' as AppView, label: 'Inbox', icon: <EnvelopeIcon /> },
      { view: 'account' as AppView, label: 'Account', icon: <UserCircleIcon />, isAccount: true },
  ];


  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-2px_5px_rgba(0,0,0,0.06)] z-30">
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map(item => (
            <NavItem
                key={item.view}
                view={item.view}
                label={item.label}
                icon={item.icon}
                activeView={activeView}
                onClick={handleNavClick}
                isAccount={item.isAccount}
            />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;