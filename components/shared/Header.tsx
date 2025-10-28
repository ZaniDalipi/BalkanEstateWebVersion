import React, { Dispatch } from 'react';
import { HomeIcon } from '../../constants';
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
        <HomeIcon className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-neutral-800">
          Balkan <span className="text-primary">Estate</span>
        </h1>
      </div>

      {/* Role Switcher */}
      <div className="absolute left-1/2 -translate-x-1/2 bg-neutral-100 p-1 rounded-full flex items-center space-x-1 border border-neutral-200 shadow-sm">
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

      <nav>
        {userRole === UserRole.BUYER && (
          <button onClick={onSubscribeClick} className="bg-secondary text-white px-5 py-2.5 rounded-full font-semibold hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md">
            Get Alerts
          </button>
        )}
        {userRole === UserRole.SELLER && (
            <button onClick={onPlansClick} className="bg-primary text-white px-5 py-2.5 rounded-full font-semibold hover:bg-primary-dark transition-all shadow-sm hover:shadow-md">
                View Plans
            </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
