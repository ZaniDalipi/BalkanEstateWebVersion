import React from 'react';
import { UserIcon, Bars3Icon, UserCircleIcon } from '../../constants';
import { UserRole } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface HeaderProps {
    onToggleSidebar: () => void;
    isFloating?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isFloating }) => {
  const { state, dispatch } = useAppContext();
  const { isAuthenticated, currentUser } = state;
  
  const handleAccountClick = () => {
    if (isAuthenticated) {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'account' });
    } else {
        dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'login' } });
    }
  };

  const handleNewListingClick = () => {
    if (isAuthenticated) {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'create-listing' });
    } else {
        dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'signup' } });
    }
  };

  const AuthButton: React.FC<{ floating?: boolean }> = ({ floating }) => {
    if (isAuthenticated && currentUser) {
      return (
        <button
          onClick={handleAccountClick}
          className={`flex items-center space-x-2 font-semibold transition-colors py-2 px-3 rounded-full whitespace-nowrap ${floating ? 'text-neutral-700 bg-white hover:bg-neutral-100' : 'text-neutral-600 hover:text-primary hover:bg-neutral-100'}`}
        >
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="User Avatar" className="w-8 h-8 rounded-full object-cover"/>
            ) : (
              <UserCircleIcon className="w-8 h-8" />
            )}
            <span className="hidden sm:inline">My Account</span>
        </button>
      );
    }
    return (
      <button
        onClick={handleAccountClick}
        className={`flex items-center space-x-2 font-semibold transition-colors py-2 px-3 rounded-full whitespace-nowrap ${floating ? 'text-neutral-700 bg-white hover:bg-neutral-100' : 'text-neutral-600 hover:text-primary hover:bg-neutral-100'}`}
      >
          <UserIcon className="w-6 h-6" />
          <span className="hidden sm:inline">Login / Register</span>
      </button>
    );
  };
  
  if (isFloating) {
    return (
      <header className="absolute top-0 right-0 z-[1001] p-4">
        <nav className="flex items-center space-x-2 sm:space-x-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: true })}
            className="bg-primary text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold hover:bg-primary-dark transition-all shadow-sm hover:shadow-md whitespace-nowrap"
          >
              Subscribe
          </button>
          <button 
            onClick={handleNewListingClick}
            className="bg-secondary text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
          >
              + New Listing
          </button>
          <AuthButton floating />
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20 flex-shrink-0">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
             <button onClick={onToggleSidebar} className="md:hidden text-neutral-600 hover:text-primary p-2 -ml-2">
                 <Bars3Icon className="w-6 h-6"/>
             </button>
             <div className="hidden md:block">
                {/* Placeholder for potential future elements like a global search */}
             </div>
          </div>

          <nav className="flex justify-end items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: true })}
              className="bg-primary text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold hover:bg-primary-dark transition-all shadow-sm hover:shadow-md whitespace-nowrap"
            >
                Subscribe
            </button>
            <button 
              onClick={handleNewListingClick}
              className="bg-secondary text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
            >
                + New Listing
            </button>
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;