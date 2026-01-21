import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider - Manages authentication state
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await authAPI.getMe();
                    setUser(response.data.user);
                } catch (err) {
                    console.error('Auth check failed:', err);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [token]);

    /**
     * Request OTP for email
     */
    const requestOTP = async (email) => {
        setError(null);
        try {
            const response = await authAPI.requestOTP(email);
            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to send OTP';
            setError(message);
            throw new Error(message);
        }
    };

    /**
     * Verify OTP and login
     */
    const verifyOTP = async (email, code) => {
        setError(null);
        try {
            const response = await authAPI.verifyOTP(email, code);
            const { token: newToken, user: userData } = response.data;

            // Save token and user
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);

            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || 'Verification failed';
            setError(message);
            throw new Error(message);
        }
    };

    /**
     * Update user profile
     */
    const updateProfile = async (data) => {
        setError(null);
        try {
            const response = await authAPI.updateProfile(data);
            setUser(response.data.user);
            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update profile';
            setError(message);
            throw new Error(message);
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    /**
     * Clear error
     */
    const clearError = () => setError(null);

    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user,
        requestOTP,
        verifyOTP,
        updateProfile,
        logout,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth hook
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
