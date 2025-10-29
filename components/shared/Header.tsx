import React, { Dispatch } from 'react';
import { LogoIcon, UserIcon } from '../../constants';
import { AppAction, UserRole } from '../../types';

interface HeaderProps {
    userRole: UserRole;
    dispatch: Dispatch<AppAction>;
    onSubscribeClick?: () => void;
    onPlansClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, dispatch, onSubscribeClick, onPlansClick }) => {
  const setRole = (role: UserRole) => {
    dispatch({ type: 'SET_USER_ROLE', payload: role });
  };

  return (
    <header className="bg-white border-b border-neutral-200 p-4 flex justify-between items-center sticky top-0 z-20">
      <div className="flex items-center space-x-2">
        <LogoIcon className="w-8 h-8 text-primary" />
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">
          Balkan <span className="text-primary">Estate</span>
        </h1>
      </div>

      {/* Role Switcher - Hidden on small screens */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-neutral-100 p-1 rounded-full items-center space-x-1 border border-neutral-200 shadow-sm">
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

      <nav className="flex items-center space-x-2 sm:space-x-4">
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
        <button
          onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })}
          className="flex items-center space-x-2 text-neutral-600 font-semibold hover:text-primary transition-colors py-2 px-3 rounded-full hover:bg-neutral-100"
        >
            <UserIcon className="w-6 h-6" />
            <span className="hidden sm:inline">Login / Register</span>
        </button>
      </nav>
    </header>
  );
};

export default Header;