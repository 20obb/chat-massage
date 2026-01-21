import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import Loading from './components/common/Loading';

/**
 * Protected Route Wrapper
 * Redirects to auth if not authenticated
 */
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Loading fullScreen text="Loading" />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

/**
 * Auth Route Wrapper
 * Redirects to chat if already authenticated
 */
function AuthRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Loading fullScreen text="Loading" />;
    }

    if (isAuthenticated) {
        return <Navigate to="/chat" replace />;
    }

    return children;
}

/**
 * App Routes Component
 * Handles routing with authentication checks
 */
function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <AuthRoute>
                        <AuthPage />
                    </AuthRoute>
                }
            />
            <Route
                path="/chat"
                element={
                    <ProtectedRoute>
                        <SocketProvider>
                            <ChatPage />
                        </SocketProvider>
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

/**
 * Main App Component
 */
export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
