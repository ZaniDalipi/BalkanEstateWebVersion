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

  const handleNavClick = (view: AppView) => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 shadow-sm z-30">
      <div className="flex justify-around max-w-lg mx-auto">
        <NavItem
          view="search"
          label="Search"
          icon={<SearchIcon />}
          activeView={state.activeView}
          onClick={handleNavClick}
        />
        <NavItem
          view="saved-searches"
          label="Saved Search"
          icon={<MagnifyingGlassPlusIcon />}
          activeView={state.activeView}
          onClick={handleNavClick}
        />
        <NavItem
          view="saved-homes"
          label="Saved Homes"
          icon={<HeartIcon />}
          activeView={state.activeView}
          onClick={handleNavClick}
        />
        <NavItem
          view="loans"
          label="Home Loans"
          icon={<BuildingLibraryIcon />}
          activeView={state.activeView}
          onClick={handleNavClick}
        />
        <NavItem
          view="inbox"
          label="Inbox"
          icon={<EnvelopeIcon />}
          activeView={state.activeView}
          onClick={handleNavClick}
        />
      </div>
    </nav>
  );
};

export default BottomNav;