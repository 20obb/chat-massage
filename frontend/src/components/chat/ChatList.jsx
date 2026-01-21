import { useState } from 'react';
import Avatar from '../common/Avatar';
import { useSocket } from '../../contexts/SocketContext';

/**
 * ChatList Component
 * Sidebar with list of chats and user search
 */
export default function ChatList({
    chats,
    activeChat,
    onSelectChat,
    onNewChat,
    onOpenProfile,
    currentUser
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const { isUserOnline } = useSocket();

    // Filter chats by search query
    const filteredChats = chats.filter(chat => {
        if (!searchQuery) return true;
        const email = chat.participant?.email || '';
        return email.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Format time for last message
    const formatTime = (date) => {
        if (!date) return '';
        const messageDate = new Date(date);
        const now = new Date();
        const diff = now - messageDate;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return messageDate.toLocaleDateString([], { weekday: 'short' });
        } else {
            return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    // Truncate message preview
    const truncateMessage = (text, maxLength = 35) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className="h-full flex flex-col bg-dark-300 border-r border-dark-200">
            {/* Header */}
            <div className="p-4 border-b border-dark-200">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-white">Chats</h1>
                    <button
                        onClick={onNewChat}
                        className="p-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-colors"
                        title="New Chat"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                        placeholder="Search chats..."
                        className="w-full bg-dark-200 border border-dark-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-center">
                            {searchQuery ? 'No chats found' : 'No conversations yet'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={onNewChat}
                                className="mt-4 text-primary-400 hover:text-primary-300 font-medium"
                            >
                                Start a new chat
                            </button>
                        )}
                    </div>
                ) : (
                    filteredChats.map((chat) => {
                        const participant = chat.participant;
                        const isActive = activeChat?._id === chat._id;
                        const online = participant ? isUserOnline(participant._id) : false;

                        return (
                            <div
                                key={chat._id}
                                onClick={() => onSelectChat(chat)}
                                className={`
                  chat-item flex items-center gap-3 p-4 cursor-pointer
                  ${isActive ? 'active' : ''}
                `}
                            >
                                <Avatar
                                    email={participant?.email || 'unknown'}
                                    isOnline={online}
                                    size="md"
                                />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-white truncate">
                                            {participant?.email?.split('@')[0] || 'Unknown'}
                                        </span>
                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                            {formatTime(chat.lastMessage?.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-400 truncate">
                                            {chat.lastMessage?.content || 'No messages yet'}
                                        </p>
                                        {chat.unreadCount > 0 && (
                                            <span className="ml-2 bg-primary-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                                                {chat.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Current user footer */}
            <div
                className="p-4 border-t border-dark-200 bg-dark-400 cursor-pointer hover:bg-dark-300 transition-colors"
                onClick={onOpenProfile}
            >
                <div className="flex items-center gap-3">
                    <Avatar email={currentUser?.email || ''} isOnline={true} size="md" />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                            {currentUser?.displayName || currentUser?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
