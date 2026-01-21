import { useState } from 'react';

/**
 * EmailInput Component
 * First step of authentication - email input
 */
export default function EmailInput({ onSubmit, loading, error }) {
    const [email, setEmail] = useState('');
    const [localError, setLocalError] = useState('');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError('');

        if (!email.trim()) {
            setLocalError('Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            setLocalError('Please enter a valid email address');
            return;
        }

        onSubmit(email.toLowerCase().trim());
    };

    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
            {/* Logo and title */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl mb-6 shadow-2xl shadow-primary-500/30">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                        <circle cx="12" cy="10" r="1.5" />
                        <circle cx="8" cy="10" r="1.5" />
                        <circle cx="16" cy="10" r="1.5" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">ChatMassage</h1>
                <p className="text-gray-400">Sign in with your email to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-field"
                        disabled={loading}
                        autoFocus
                        autoComplete="email"
                    />
                </div>

                {/* Error messages */}
                {(localError || error) && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm animate-slide-up">
                        {localError || error}
                    </div>
                )}

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Sending code...</span>
                        </>
                    ) : (
                        <>
                            <span>Continue</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </>
                    )}
                </button>
            </form>

            {/* Info text */}
            <p className="text-center text-gray-500 text-sm mt-6">
                We'll send you a 6-digit verification code
            </p>
        </div>
    );
}
