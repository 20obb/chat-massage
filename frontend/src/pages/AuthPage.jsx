import { useState } from 'react';
import EmailInput from '../components/auth/EmailInput';
import OTPVerification from '../components/auth/OTPVerification';
import { useAuth } from '../contexts/AuthContext';

/**
 * AuthPage
 * Handles email input and OTP verification
 */
export default function AuthPage() {
    const [step, setStep] = useState('email'); // 'email' | 'otp'
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const { requestOTP, verifyOTP, error, clearError } = useAuth();

    const handleEmailSubmit = async (emailInput) => {
        setLoading(true);
        clearError();

        try {
            await requestOTP(emailInput);
            setEmail(emailInput);
            setStep('otp');
        } catch (err) {
            // Error is handled by AuthContext
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (code) => {
        setLoading(true);
        clearError();

        try {
            await verifyOTP(email, code);
            // Navigation handled by App component
        } catch (err) {
            // Error is handled by AuthContext
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        clearError();

        try {
            await requestOTP(email);
        } catch (err) {
            // Error handled by context
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep('email');
        clearError();
    };

    return (
        <div className="min-h-screen bg-dark-400 flex items-center justify-center p-4">
            {/* Background gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-primary-900/20 via-dark-400 to-dark-400 pointer-events-none" />

            {/* Decorative elements */}
            <div className="fixed top-20 left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-20 right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 w-full">
                {step === 'email' ? (
                    <EmailInput
                        onSubmit={handleEmailSubmit}
                        loading={loading}
                        error={error}
                    />
                ) : (
                    <OTPVerification
                        email={email}
                        onSubmit={handleOTPSubmit}
                        onResend={handleResendOTP}
                        onBack={handleBack}
                        loading={loading}
                        error={error}
                    />
                )}
            </div>
        </div>
    );
}
