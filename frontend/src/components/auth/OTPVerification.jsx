import { useState, useRef, useEffect } from 'react';

/**
 * OTPVerification Component  
 * Second step of authentication - OTP input
 */
export default function OTPVerification({
    email,
    onSubmit,
    onResend,
    onBack,
    loading,
    error
}) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when complete
        if (value && index === 5) {
            const code = newOtp.join('');
            if (code.length === 6) {
                onSubmit(code);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                const digits = text.replace(/\D/g, '').slice(0, 6).split('');
                if (digits.length > 0) {
                    const newOtp = [...otp];
                    digits.forEach((digit, i) => {
                        if (i < 6) newOtp[i] = digit;
                    });
                    setOtp(newOtp);

                    // Focus appropriate input
                    const focusIndex = Math.min(digits.length, 5);
                    inputRefs.current[focusIndex]?.focus();

                    // Auto-submit if complete
                    if (digits.length === 6) {
                        onSubmit(digits.join(''));
                    }
                }
            });
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');

        if (digits.length > 0) {
            const newOtp = [...otp];
            digits.forEach((digit, i) => {
                if (i < 6) newOtp[i] = digit;
            });
            setOtp(newOtp);

            const focusIndex = Math.min(digits.length, 5);
            inputRefs.current[focusIndex]?.focus();

            if (digits.length === 6) {
                onSubmit(digits.join(''));
            }
        }
    };

    const handleResend = () => {
        if (canResend) {
            setOtp(['', '', '', '', '', '']);
            setCountdown(60);
            setCanResend(false);
            onResend();
            inputRefs.current[0]?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length === 6) {
            onSubmit(code);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
            </button>

            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl mb-4 shadow-xl shadow-green-500/20">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                <p className="text-gray-400">
                    We sent a code to <span className="text-primary-400 font-medium">{email}</span>
                </p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Inputs */}
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="otp-input"
                            disabled={loading}
                        />
                    ))}
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center animate-slide-up">
                        {error}
                    </div>
                )}

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Verifying...</span>
                        </>
                    ) : (
                        <span>Verify Code</span>
                    )}
                </button>

                {/* Resend option */}
                <div className="text-center">
                    {canResend ? (
                        <button
                            type="button"
                            onClick={handleResend}
                            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                        >
                            Resend code
                        </button>
                    ) : (
                        <p className="text-gray-500">
                            Resend code in <span className="text-gray-400 font-medium">{countdown}s</span>
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}
