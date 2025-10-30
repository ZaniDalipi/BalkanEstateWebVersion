import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { AppView } from '../../types';
import { BuildingLibraryIcon, EnvelopeIcon, HeartIcon, MagnifyingGlassPlusIcon, SearchIcon } from '../../constants';

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
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        isActive ? 'text-primary' : 'text-neutral-500 hover:text-primary'
      }`}
    >
      <div className="w-6 h-6 mb-1">{icon}</div>
      <span className={`text-xs font-bold ${isActive ? 'text-primary' : ''}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { activeView, isAuthenticated } = state;

  const handleNavClick = (view: AppView) => {
    if (view === 'inbox' && !isAuthenticated) {
        dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
        return;
    }
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-2px_5px_rgba(0,0,0,0.06)] z-30">
      <div className="flex justify-around max-w-lg mx-auto">
        <NavItem
          view="search"
          label="Search"
          icon={<SearchIcon />}
          activeView={activeView}
          onClick={handleNavClick}
        />
        <NavItem
          view="saved-searches"
          label="Saved Search"
          icon={<MagnifyingGlassPlusIcon />}
          activeView={activeView}
          onClick={handleNavClick}
        />
        <NavItem
          view="saved-homes"
          label="Saved Homes"
          icon={<HeartIcon />}
          activeView={activeView}
          onClick={handleNavClick}
        />
        <NavItem
          view="loans"
          label="Home Loans"
          icon={<BuildingLibraryIcon />}
          activeView={activeView}
          onClick={handleNavClick}
        />
        <NavItem
          view="inbox"
          label="Inbox"
          icon={<EnvelopeIcon />}
          activeView={activeView}
          onClick={handleNavClick}
        />
      </div>
    </nav>
  );
};

export default BottomNav;