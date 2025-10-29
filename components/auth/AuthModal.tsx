import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { useAppContext } from '../../context/AppContext';
import { AppleIcon, DevicePhoneMobileIcon, EnvelopeIcon, FacebookIcon, GoogleIcon, LogoIcon } from '../../constants';

type View = 'login' | 'signup';
type Method = 'email' | 'phone';

const SocialButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
        <div className="w-6 h-6">{icon}</div>
        <span className="text-base font-semibold text-neutral-700">{label}</span>
    </button>
);

const AuthModal: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [view, setView] = useState<View>('login');
    const [method, setMethod] = useState<Method>('email');

    const handleClose = () => {
        dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: false });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here would be actual validation and API calls
        // For now, just simulate success
        dispatch({ type: 'SET_IS_AUTHENTICATED', payload: true });
        handleClose();
        
        // REMOVED: No longer showing pricing plans on login.
        // It now only shows after a user creates a new listing.
    };

    const floatingInputClasses = "block px-2.5 pb-2.5 pt-4 w-full text-base text-neutral-900 bg-white rounded-lg border border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer";
    const floatingLabelClasses = "absolute text-base text-neutral-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1";

    const renderForm = () => {
        const isLogin = view === 'login';
        if (method === 'email') {
            return (
                <div className="space-y-4">
                    <div className="relative">
                        <input type="email" id="email" className={floatingInputClasses} placeholder=" " required />
                        <label htmlFor="email" className={floatingLabelClasses}>Email Address</label>
                    </div>
                    <div className="relative">
                        <input type="password" id="password" className={floatingInputClasses} placeholder=" " required />
                        <label htmlFor="password" className={floatingLabelClasses}>Password</label>
                    </div>
                    {isLogin && (
                         <div className="text-right">
                            <button className="text-sm font-semibold text-primary hover:underline">Forgot Password?</button>
                        </div>
                    )}
                    {!isLogin && (
                        <div className="relative">
                            <input type="password" id="confirmPassword" className={floatingInputClasses} placeholder=" " required />
                            <label htmlFor="confirmPassword" className={floatingLabelClasses}>Confirm Password</label>
                        </div>
                    )}
                </div>
            )
        } else { // phone
            return (
                <div className="space-y-4">
                    <div className="relative">
                        <input type="tel" id="phone" className={floatingInputClasses} placeholder=" " required />
                        <label htmlFor="phone" className={floatingLabelClasses}>Phone Number</label>
                    </div>
                    {!isLogin && (
                        <div className="relative">
                            <input type="email" id="phone_email" className={floatingInputClasses} placeholder=" " required />
                            <label htmlFor="phone_email" className={floatingLabelClasses}>Your Email Address</label>
                        </div>
                    )}
                    <button className="w-full py-3 px-4 border border-neutral-300 rounded-lg font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
                        Send Code
                    </button>
                </div>
            )
        }
    }

    return (
        <Modal 
            isOpen={state.isAuthModalOpen} 
            onClose={handleClose} 
            title=""
        >
            <div className="w-full max-w-md mx-auto">
                <div className="flex justify-center items-center space-x-2 mb-4">
                    <LogoIcon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 text-center mb-4 sm:mb-6">{view === 'login' ? 'Welcome Back!' : 'Create an Account'}</h2>


                <div className="bg-neutral-100 p-1 rounded-full flex items-center space-x-1 border border-neutral-200 shadow-sm mb-4 sm:mb-6">
                    <button
                        onClick={() => setView('login')}
                        className={`w-1/2 px-4 py-2 rounded-full text-base font-semibold transition-all duration-300 ${view === 'login' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}
                    >Login</button>
                    <button
                        onClick={() => setView('signup')}
                        className={`w-1/2 px-4 py-2 rounded-full text-base font-semibold transition-all duration-300 ${view === 'signup' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}
                    >Sign Up</button>
                </div>

                <div className="bg-neutral-100 p-1 rounded-full flex items-center space-x-1 border border-neutral-200 shadow-sm mb-4 sm:mb-6 max-w-xs mx-auto">
                    <button
                        onClick={() => setMethod('email')}
                        className={`w-1/2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${method === 'email' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}
                    >
                        <EnvelopeIcon className="w-5 h-5"/>
                        Email
                    </button>
                    <button
                        onClick={() => setMethod('phone')}
                        className={`w-1/2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${method === 'phone' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}
                    >
                        <DevicePhoneMobileIcon className="w-5 h-5"/>
                        Phone
                    </button>
                </div>


                <form onSubmit={handleFormSubmit}>
                    {renderForm()}
                    <button type="submit" className="w-full mt-6 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base sm:text-lg font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        {view === 'login' ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <div className="my-4 sm:my-6 flex items-center">
                    <div className="flex-grow border-t border-neutral-300"></div>
                    <span className="flex-shrink mx-4 text-neutral-500 font-medium text-sm">Or continue with</span>
                    <div className="flex-grow border-t border-neutral-300"></div>
                </div>

                <div className="space-y-3">
                    <SocialButton icon={<GoogleIcon/>} label="Continue with Google" />
                    <SocialButton icon={<FacebookIcon/>} label="Continue with Facebook" />
                    <SocialButton icon={<AppleIcon className="text-black"/>} label="Continue with Apple" />
                </div>
                
                <div className="text-center mt-6">
                    <p className="text-sm text-neutral-600">
                        {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="font-bold text-primary hover:underline">
                             {view === 'login' ? "Sign Up" : "Log In"}
                        </button>
                    </p>
                </div>

            </div>
        </Modal>
    );
};

export default AuthModal;