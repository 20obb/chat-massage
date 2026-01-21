import { useState, useEffect } from 'react';
import Avatar from '../common/Avatar';
import { authAPI } from '../../services/api';

/**
 * NewChatModal Component
 * Modal for starting a new chat with a user
 */
export default function NewChatModal({ isOpen, onClose, onSelectUser }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Search for users
    useEffect(() => {
        if (!isOpen) return;

        const searchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await authAPI.searchUsers(searchQuery);
                setUsers(response.data.users);
            } catch (err) {
                setError('Failed to search users');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, isOpen]);

    const handleSelectUser = (user) => {
        onSelectUser(user);
        onClose();
        setSearchQuery('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-dark-300 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="p-4 border-b border-dark-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">New Chat</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-dark-200 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search input */}
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by email..."
                            className="w-full bg-dark-200 border border-dark-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary-500"
                            autoFocus
                        />
                    </div>
                </div>

                {/* User list */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-400">{error}</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchQuery ? 'No users found' : 'Search for users to start a chat'}
                        </div>
                    ) : (
                        <div className="py-2">
                            {users.map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => handleSelectUser(user)}
                                    className="w-full flex items-center gap-3 p-4 hover:bg-dark-200 transition-colors"
                                >
                                    <Avatar email={user.email} isOnline={user.isOnline} size="md" />
                                    <div className="text-left">
                                        <p className="font-medium text-white">{user.email.split('@')[0]}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
