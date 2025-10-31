import React from 'react';
import { LogoIcon, UserIcon, SearchIcon, MagnifyingGlassPlusIcon, HeartIcon, BuildingLibraryIcon, EnvelopeIcon, UserCircleIcon } from '../../constants';
import { UserRole, AppView } from '../../types';
import { useAppContext } from '../../context/AppContext';

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
      className={`flex flex-col items-center justify-center py-4 px-2 transition-colors duration-200 group`}
    >
      <div className={`w-6 h-6 mb-1 ${isActive ? 'text-primary' : 'text-neutral-500 group-hover:text-primary'}`}>{icon}</div>
      <span className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-neutral-500 group-hover:text-primary'}`}>{label}</span>
    </button>
  );
};

interface HeaderProps {
    onSubscribeClick?: () => void;
    onPlansClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSubscribeClick, onPlansClick }) => {
  const { state, dispatch } = useAppContext();
  const { userRole, activeView, isAuthenticated, currentUser } = state;

  const setRole = (role: UserRole) => {
    dispatch({ type: 'SET_USER_ROLE', payload: role });
     // If switching to a role that doesn't have the current view, switch to a default view
    if (role === UserRole.SELLER && activeView !== 'search') {
      dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search'});
    }
  };
  
  const handleNavClick = (view: AppView) => {
    if ((view === 'inbox' || view === 'account') && !isAuthenticated) {
        dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
        return;
    }
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  };

  const handleLogoClick = () => {
    dispatch({ type: 'SET_USER_ROLE', payload: UserRole.BUYER });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {userRole === UserRole.BUYER && (
             <div className="hidden md:flex justify-center border-b border-neutral-200">
                <nav className="flex space-x-4 sm:space-x-8">
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
                      view="inbox"
                      label="Inbox"
                      icon={<EnvelopeIcon />}
                      activeView={activeView}
                      onClick={handleNavClick}
                    />
                </nav>
            </div>
        )}
       
        <div className="flex justify-between items-center py-3">
          <button onClick={handleLogoClick} className="flex-1 flex justify-start items-center space-x-2 group">
            <LogoIcon className="w-8 h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">
              Balkan <span className="text-primary">Estate</span>
            </h1>
          </button>

          <div className="hidden md:flex justify-center bg-neutral-100 p-1 rounded-full items-center space-x-1 border border-neutral-200 shadow-sm">
            <button
              onClick={() => setRole(UserRole.BUYER)}
              className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                userRole === UserRole.BUYER
                  ? 'bg-white text-primary shadow'
                  : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setRole(UserRole.SELLER)}
              className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                userRole === UserRole.SELLER
                  ? 'bg-white text-primary shadow'
                  : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Sell
            </button>
          </div>

          <nav className="flex-1 flex justify-end items-center space-x-2 sm:space-x-4">
            {userRole === UserRole.BUYER && (
              <button onClick={onSubscribeClick} className="bg-secondary text-white px-3 sm:px-5 py-2.5 rounded-full text-sm sm:text-base font-semibold hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md">
                Get Alerts
              </button>
            )}
            {userRole === UserRole.SELLER && (
                <button onClick={onPlansClick} className="bg-primary text-white px-3 sm:px-5 py-2.5 rounded-full text-sm sm:text-base font-semibold hover:bg-primary-dark transition-all shadow-sm hover:shadow-md">
                    View Plans
                </button>
            )}

            {isAuthenticated && currentUser ? (
                 <button
                  onClick={() => handleNavClick('account')}
                  className="flex items-center space-x-2 text-neutral-600 font-semibold hover:text-primary transition-colors py-2 px-3 rounded-full hover:bg-neutral-100"
                >
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="User Avatar" className="w-8 h-8 rounded-full object-cover"/>
                    ) : (
                      <UserCircleIcon className="w-8 h-8" />
                    )}
                    <span className="hidden sm:inline">My Account</span>
                </button>
            ) : (
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })}
                  className="flex items-center space-x-2 text-neutral-600 font-semibold hover:text-primary transition-colors py-2 px-3 rounded-full hover:bg-neutral-100"
                >
                    <UserIcon className="w-6 h-6" />
                    <span className="hidden sm:inline">Login / Register</span>
                </button>
            )}
          </nav>
        </div>
        
        <div className="md:hidden flex justify-center pb-3 border-b border-neutral-200">
            <div className="bg-neutral-100 p-1 rounded-full flex items-center space-x-1 border border-neutral-200 shadow-sm">
                <button
                  onClick={() => setRole(UserRole.BUYER)}
                  className={`px-10 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    userRole === UserRole.BUYER
                      ? 'bg-white text-primary shadow'
                      : 'text-neutral-600'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setRole(UserRole.SELLER)}
                  className={`px-10 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    userRole === UserRole.SELLER
                      ? 'bg-white text-primary shadow'
                      : 'text-neutral-600'
                  }`}
                >
                  Sell
                </button>
            </div>
        </div>

      </div>
    </header>
  );
};

export default Header;