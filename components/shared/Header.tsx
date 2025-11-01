import React from 'react';
import { UserIcon, Bars3Icon, UserCircleIcon } from '../../constants';
import { UserRole } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface HeaderProps {
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { state, dispatch } = useAppContext();
  const { userRole, isAuthenticated, currentUser } = state;

  const setRole = (role: UserRole) => {
    dispatch({ type: 'SET_USER_ROLE', payload: role });
    // Switch to a default view for the new role
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search'});
  };
  
  const handleAccountClick = () => {
    if (isAuthenticated) {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'account' });
    } else {
        dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20 flex-shrink-0">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex-1 flex items-center">
             <button onClick={onToggleSidebar} className="md:hidden text-neutral-600 hover:text-primary p-2 -ml-2">
                 <Bars3Icon className="w-6 h-6"/>
             </button>
          </div>

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
              <button 
                onClick={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: true })} 
                className="bg-secondary text-white px-3 sm:px-5 py-2.5 rounded-full text-sm sm:text-base font-semibold hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md"
              >
                Get Alerts
              </button>
            )}
            {userRole === UserRole.SELLER && (
                <button 
                  onClick={() => dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: true, isOffer: false } })} 
                  className="bg-primary text-white px-3 sm:px-5 py-2.5 rounded-full text-sm sm:text-base font-semibold hover:bg-primary-dark transition-all shadow-sm hover:shadow-md"
                >
                    View Plans
                </button>
            )}

            {isAuthenticated && currentUser ? (
                 <button
                  onClick={handleAccountClick}
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
                  onClick={handleAccountClick}
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