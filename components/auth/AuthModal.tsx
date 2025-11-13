import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AppleIcon, DevicePhoneMobileIcon, EnvelopeIcon, FacebookIcon, GoogleIcon, LogoIcon, XMarkIcon } from '../../constants';
import { User, UserRole, AuthModalView } from '../../types';
import SocialLoginPopup from './SocialLoginPopup';

type Method = 'email' | 'phone';
type SocialProvider = 'google' | 'facebook' | 'apple';

const validatePassword = (password: string) => {
    if (password.length < 8) {
        return "Password must be at least 8 characters long.";
    }
    if (!/\d/.test(password)) {
        return "Password must contain at least one number.";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }
    return null;
};

const SocialButton: React.FC<{ icon: React.ReactNode; label: string, onClick: () => void, disabled: boolean }> = ({ icon, label, onClick, disabled }) => (
    <button type="button" onClick={onClick} disabled={disabled} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50">
        <div className="w-6 h-6">{icon}</div>
        <span className="text-base font-semibold text-neutral-700">{label}</span>
    </button>
);

const AuthPage: React.FC = () => {
    const { state, dispatch, login, signup, requestPasswordReset, loginWithSocial, sendPhoneCode, verifyPhoneCode, completePhoneSignup } = useAppContext();

    const [method, setMethod] = useState<Method>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [socialLoginProvider, setSocialLoginProvider] = useState<SocialProvider | null>(null);
    const [availableProviders, setAvailableProviders] = useState<{ google: boolean; facebook: boolean; apple: boolean }>({ google: false, facebook: false, apple: false });

    // Form fields state
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [code, setCode] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        // Fetch available OAuth providers
        const fetchProviders = async () => {
            try {
                const { getAvailableOAuthProviders } = await import('../../services/apiService');
                const providers = await getAvailableOAuthProviders();
                setAvailableProviders(providers);
            } catch (error) {
                console.error('Error fetching OAuth providers:', error);
            }
        };
        fetchProviders();
    }, []);

    useEffect(() => {
        // Reset state when modal opens or view changes
        setError(null);
        setInfoMessage(null);
        setIsLoading(false);
    }, [state.isAuthModalOpen, state.authModalView]);

    const handleClose = () => {
        dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: false } });
    };
    
    // --- Social Login Handlers ---
    const handleSocialLoginClick = (provider: SocialProvider) => {
        setIsLoading(true); // Disable buttons on main modal
        setSocialLoginProvider(provider);
    };

    const handleSocialLoginSuccess = (provider: SocialProvider) => {
        // Initiate OAuth flow by redirecting to backend
        loginWithSocial(provider);
        // No need to close modal or handle success here - the OAuth callback page will handle it
    };
    
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (state.authModalView === 'signup') {
            const passwordError = validatePassword(password);
            if (passwordError) {
                setError(passwordError);
                setIsLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                setIsLoading(false);
                return;
            }
        }
        
        try {
            if (state.authModalView === 'login') {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            handleClose();
        } catch (err: any) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await requestPasswordReset(email);
            dispatch({ type: 'SET_AUTH_MODAL_VIEW', payload: 'forgotPasswordSuccess' });
        } catch(err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await sendPhoneCode(phone);
            dispatch({ type: 'SET_AUTH_MODAL_VIEW', payload: 'phoneCode' });
        } catch(err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const result = await verifyPhoneCode(phone, code);
            if (result.isNew) {
                dispatch({ type: 'SET_AUTH_MODAL_VIEW', payload: 'phoneDetails' });
            } else {
                handleClose();
            }
        } catch(err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await completePhoneSignup(phone, name, email);
            handleClose();
        } catch(err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const floatingInputClasses = "block px-2.5 pb-2.5 pt-4 w-full text-base text-neutral-900 bg-white rounded-lg border border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer";
    const floatingLabelClasses = "absolute text-base text-neutral-700 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1";

    const renderContent = () => {
        switch (state.authModalView) {
            case 'login':
            case 'signup':
                return (
                    <>
                        <div className="bg-neutral-100 p-1 rounded-full flex items-center space-x-1 border border-neutral-200 shadow-sm mb-4 sm:mb-6">
                            <button onClick={() => dispatch({ type: 'SET_AUTH_MODAL_VIEW', payload: 'login' })} className={`w-1/2 px-4 py-2 rounded-full text-base font-semibold transition-all duration-300 ${state.authModalView === 'login' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}>Login</button>
                            <button onClick={() => dispatch({ type: 'SET_AUTH_MODAL_VIEW', payload: 'signup' })} className={`w-1/2 px-4 py-2 rounded-full text-base font-semibold transition-all duration-300 ${state.authModalView === 'signup' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}>Sign Up</button>
                        </div>
                        <div className="bg-neutral-100 p-1 rounded-full flex items-center space-x-1 border border-neutral-200 shadow-sm mb-4 sm:mb-6 max-w-xs mx-auto">
                            <button onClick={() => setMethod('email')} className={`w-1/2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${method === 'email' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}><EnvelopeIcon className="w-5 h-5"/>Email</button>
                            <button onClick={() => setMethod('phone')} className={`w-1/2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${method === 'phone' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}><DevicePhoneMobileIcon className="w-5 h-5"/>Phone</button>
                        </div>
                        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                        
                        {method === 'email' ? (
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div className="relative"><input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={floatingInputClasses} placeholder=" " required /><label htmlFor="email" className={floatingLabelClasses}>Email Address</label></div>
                                <div className="relative"><input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className={floatingInputClasses} placeholder=" " required /><label htmlFor="password" className={floatingLabelClasses}>Password</label></div>
                                {state.authModalView === 'login' && <div className="text-right"><button type="button" onClick={() => dispatch({ type: 'SET_AUTH_MODAL_VIEW', payload: 'forgotPassword'})} className="text-sm font-semibold text-primary hover:underline">Forgot Password?</button></div>}
                                {state.authModalView === 'signup' && <div className="relative"><input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={floatingInputClasses} placeholder=" " required /><label htmlFor="confirmPassword" className={floatingLabelClasses}>Confirm Password</label></div>}
                                <button type="submit" disabled={isLoading} className="w-full mt-2 py-3 px-4 rounded-lg shadow-sm text-base sm:text-lg font-bold text-white bg-primary hover:bg-primary-dark disabled:opacity-50">{isLoading ? 'Processing...' : (state.authModalView === 'login' ? 'Log In' : 'Sign Up')}</button>
                            </form>
                        ) : (
                             <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                <div className="relative"><input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className={floatingInputClasses} placeholder=" " required /><label htmlFor="phone" className={floatingLabelClasses}>Phone Number</label></div>
                                <button type="submit" disabled={isLoading} className="w-full mt-2 py-3 px-4 rounded-lg shadow-sm text-base sm:text-lg font-bold text-white bg-primary hover:bg-primary-dark disabled:opacity-50">{isLoading ? 'Sending...' : 'Send Code'}</button>
                            </form>
                        )}
                        
                        {(availableProviders.google || availableProviders.facebook || availableProviders.apple) && (
                            <>
                                <div className="my-4 sm:my-6 flex items-center"><div className="flex-grow border-t border-neutral-300"></div><span className="flex-shrink mx-4 text-neutral-500 font-medium text-sm">Or continue with</span><div className="flex-grow border-t border-neutral-300"></div></div>
                                <div className="space-y-3">
                                    {availableProviders.google && <SocialButton icon={<GoogleIcon/>} label="Continue with Google" onClick={() => handleSocialLoginClick('google')} disabled={isLoading} />}
                                    {availableProviders.facebook && <SocialButton icon={<FacebookIcon/>} label="Continue with Facebook" onClick={() => handleSocialLoginClick('facebook')} disabled={isLoading} />}
                                    {availableProviders.apple && <SocialButton icon={<AppleIcon className="text-black"/>} label="Continue with Apple" onClick={() => handleSocialLoginClick('apple')} disabled={isLoading} />}
                                </div>
                            </>
                        )}
                    </>
                );
            case 'forgotPassword':
                return (
                    <>
                        <h3 className="text-lg font-bold text-center mb-4">Reset Password</h3>
                        <p className="text-sm text-neutral-600 text-center mb-6">Enter your email address and we'll send you a link to reset your password.</p>
                        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                        <form onSubmit={handlePasswordResetRequest} className="space-y-4">
                             <div className="relative"><input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={floatingInputClasses} placeholder=" " required /><label htmlFor="email" className={floatingLabelClasses}>Email Address</label></div>
                            <button type="submit" disabled={isLoading} className="w-full mt-2 py-3 px-4 rounded-lg shadow-sm font-bold text-white bg-primary hover:bg-primary-dark disabled:opacity-50">{isLoading ? 'Sending...' : 'Send Reset Link'}</button>
                            <button type="button" onClick={() => dispatch({ type: 'SET_AUTH_MODAL_VIEW', payload: 'login' })} className="w-full text-sm font-semibold text-primary hover:underline mt-2">Back to Login</button>
                        </form>
                    </>
                );
            case 'forgotPasswordSuccess':
                 return (
                    <div className="text-center">
                        <h3 className="text-lg font-bold mb-4">Check Your Email</h3>
                        <p className="text-sm text-neutral-600 mb-6">We've sent a password reset link to <span className="font-semibold">{email}</span>.</p>
                        <button onClick={() => dispatch({ type: 'SET_AUTH_MODAL_VIEW', payload: 'login' })} className="w-full py-3 px-4 rounded-lg font-bold text-white bg-primary hover:bg-primary-dark">Back to Login</button>
                    </div>
                );
            case 'phoneCode':
                 return (
                    <>
                        <h3 className="text-lg font-bold text-center mb-4">Enter Code</h3>
                        <p className="text-sm text-neutral-600 text-center mb-6">We've sent a 6-digit code to <span className="font-semibold">{phone}</span>.</p>
                        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                        <form onSubmit={handleCodeSubmit} className="space-y-4">
                             <div className="relative"><input type="text" id="code" value={code} onChange={e => setCode(e.target.value)} className={floatingInputClasses} placeholder=" " required /><label htmlFor="code" className={floatingLabelClasses}>6-Digit Code</label></div>
                            <button type="submit" disabled={isLoading} className="w-full mt-2 py-3 px-4 rounded-lg shadow-sm font-bold text-white bg-primary hover:bg-primary-dark disabled:opacity-50">{isLoading ? 'Verifying...' : 'Verify'}</button>
                            <button type="button" onClick={() => { setMethod('phone'); dispatch({ type: 'SET_AUTH_MODAL_VIEW', payload: 'login' }); }} className="w-full text-sm font-semibold text-primary hover:underline mt-2">Back</button>
                        </form>
                    </>
                );
            case 'phoneDetails':
                 return (
                     <>
                        <h3 className="text-lg font-bold text-center mb-4">Complete Your Profile</h3>
                        <p className="text-sm text-neutral-600 text-center mb-6">Just a few more details to create your account.</p>
                        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                        <form onSubmit={handlePhoneDetailsSubmit} className="space-y-4">
                            <div className="relative"><input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={floatingInputClasses} placeholder=" " required /><label htmlFor="name" className={floatingLabelClasses}>Full Name</label></div>
                            <div className="relative"><input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={floatingInputClasses} placeholder=" " required /><label htmlFor="email" className={floatingLabelClasses}>Email Address</label></div>
                            <button type="submit" disabled={isLoading} className="w-full mt-2 py-3 px-4 rounded-lg shadow-sm font-bold text-white bg-primary hover:bg-primary-dark disabled:opacity-50">{isLoading ? 'Creating Account...' : 'Complete Sign Up'}</button>
                        </form>
                    </>
                );
            default:
                return null;
        }
    };
    

    return (
        <>
            {socialLoginProvider && (
                <SocialLoginPopup
                    provider={socialLoginProvider}
                    onSuccess={() => handleSocialLoginSuccess(socialLoginProvider)}
                    onClose={() => {
                        setSocialLoginProvider(null);
                        setIsLoading(false);
                    }}
                />
            )}
            <div className="fixed inset-0 z-[5000] flex justify-center items-center bg-black/50 p-4" onClick={handleClose}>
                <div className="bg-white w-full h-full md:h-auto md:max-w-md md:rounded-2xl md:shadow-2xl flex flex-col relative overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <button onClick={handleClose} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800 z-10"><XMarkIcon className="w-6 h-6" /></button>
                    <div className="p-6 sm:p-8 w-full max-w-md mx-auto mt-8 md:mt-0">
                        <div className="flex justify-center items-center space-x-2 mb-4"><LogoIcon className="w-8 h-8 text-primary" /></div>
                        <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 text-center mb-4 sm:mb-6">
                            {state.authModalView === 'login' ? 'Welcome Back!' : 'Create an Account'}
                        </h2>
                        {renderContent()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;