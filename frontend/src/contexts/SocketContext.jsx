import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * SocketProvider - Manages Socket.io connection
 */
export function SocketProvider({ children }) {
    const { token, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    // Connect to socket when authenticated
    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        // Create socket connection with auth
        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Connection events
        newSocket.on('connect', () => {
            console.log('Socket connected');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        // User presence events
        newSocket.on('user_online', ({ userId }) => {
            setOnlineUsers(prev => new Set([...prev, userId]));
        });

        newSocket.on('user_offline', ({ userId }) => {
            setOnlineUsers(prev => {
                const updated = new Set(prev);
                updated.delete(userId);
                return updated;
            });
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, token]);

    /**
     * Join a chat room
     */
    const joinChat = useCallback((chatId) => {
        if (socket && connected) {
            socket.emit('join', chatId);
        }
    }, [socket, connected]);

    /**
     * Leave a chat room
     */
    const leaveChat = useCallback((chatId) => {
        if (socket && connected) {
            socket.emit('leave', chatId);
        }
    }, [socket, connected]);

    /**
     * Send a message
     */
    const sendMessage = useCallback((chatId, content) => {
        if (socket && connected) {
            socket.emit('send_message', { chatId, content });
        }
    }, [socket, connected]);

    /**
     * Mark messages as seen
     */
    const markSeen = useCallback((chatId) => {
        if (socket && connected) {
            socket.emit('mark_seen', { chatId });
        }
    }, [socket, connected]);

    /**
     * Send typing indicator
     */
    const sendTyping = useCallback((chatId, isTyping) => {
        if (socket && connected) {
            socket.emit('typing', { chatId, isTyping });
        }
    }, [socket, connected]);

    /**
     * Check if a user is online
     */
    const isUserOnline = useCallback((userId) => {
        return onlineUsers.has(userId);
    }, [onlineUsers]);

    const value = {
        socket,
        connected,
        onlineUsers,
        joinChat,
        leaveChat,
        sendMessage,
        markSeen,
        sendTyping,
        isUserOnline,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}

/**
 * useSocket hook
 */
export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}
