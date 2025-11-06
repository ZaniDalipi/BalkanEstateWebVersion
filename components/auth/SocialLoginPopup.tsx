import React, { useState, useEffect } from 'react';
import { GoogleIcon, FacebookIcon, AppleIcon, SpinnerIcon, CheckCircleIcon, XMarkIcon } from '../../constants';

type Provider = 'google' | 'facebook' | 'apple';
type Status = 'authenticating' | 'success';

interface SocialLoginPopupProps {
    provider: Provider;
    onSuccess: () => void;
    onClose: () => void;
}

const providerDetails: Record<Provider, { name: string; icon: React.ReactNode }> = {
    google: { name: 'Google', icon: <GoogleIcon /> },
    facebook: { name: 'Facebook', icon: <FacebookIcon /> },
    apple: { name: 'Apple', icon: <AppleIcon className="text-black" /> },
};

const SocialLoginPopup: React.FC<SocialLoginPopupProps> = ({ provider, onSuccess, onClose }) => {
    const [status, setStatus] = useState<Status>('authenticating');
    const details = providerDetails[provider];

    useEffect(() => {
        // Simulate the authentication process
        const authTimer = setTimeout(() => {
            setStatus('success');
        }, 2500); // 2.5 seconds for fake network request

        return () => clearTimeout(authTimer);
    }, []);

    useEffect(() => {
        if (status === 'success') {
            // After showing success, trigger the actual login and close the popup
            const successTimer = setTimeout(() => {
                onSuccess();
            }, 1000); // Show success message for 1 second

            return () => clearTimeout(successTimer);
        }
    }, [status, onSuccess]);

    return (
        <div className="fixed inset-0 bg-black/30 z-[6000] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm animate-fade-in">
                <div className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6">{details.icon}</div>
                        <h2 className="font-semibold text-neutral-700">Sign in with {details.name}</h2>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
                        <XMarkIcon className="w-5 h-5"/>
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center justify-center h-48">
                    {status === 'authenticating' && (
                        <>
                            <SpinnerIcon className="w-12 h-12 text-primary" />
                            <p className="mt-4 text-neutral-600 font-medium">Authenticating...</p>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <CheckCircleIcon className="w-16 h-16 text-green-500" />
                            <p className="mt-4 text-neutral-600 font-medium">Authentication Successful!</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocialLoginPopup;