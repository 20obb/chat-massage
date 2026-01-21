import { useState, useEffect } from 'react';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import NewChatModal from '../components/chat/NewChatModal';
import ProfileModal from '../components/profile/ProfileModal';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { chatAPI } from '../services/api';

/**
 * ChatPage
 * Main chat interface with sidebar and chat window
 */
export default function ChatPage() {
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [showNewChat, setShowNewChat] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mobileShowChat, setMobileShowChat] = useState(false);

    const { user, logout } = useAuth();
    const { socket } = useSocket();

    // Load chats
    useEffect(() => {
        const loadChats = async () => {
            try {
                const response = await chatAPI.getChats();
                setChats(response.data.chats);
            } catch (error) {
                console.error('Failed to load chats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadChats();
    }, []);

    // Listen for chat updates
    useEffect(() => {
        if (!socket) return;

        const handleChatUpdated = (data) => {
            setChats(prev => {
                const updated = prev.map(chat =>
                    chat._id === data.chatId
                        ? { ...chat, lastMessage: data.lastMessage }
                        : chat
                );
                return updated.sort((a, b) =>
                    new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
                );
            });
        };

        const handleNewMessage = (data) => {
            // Check if we have this chat
            setChats(prev => {
                const chatExists = prev.find(c => c._id === data.message.chatId);

                // If chat exists, it will be updated by handleChatUpdated usually, 
                // but we can ensure unread count updates here if needed.
                // For now, let's focus on auto-adding NEW chats.

                if (!chatExists) {
                    // Fetch the new chat details
                    chatAPI.getChats().then(res => {
                        const newChat = res.data.chats.find(c => c._id === data.message.chatId);
                        if (newChat) {
                            setChats(current => [newChat, ...current]);
                        }
                    });
                }
                return prev;
            });
        };

        socket.on('chat_updated', handleChatUpdated);
        socket.on('receive_message', handleNewMessage);

        return () => {
            socket.off('chat_updated', handleChatUpdated);
            socket.off('receive_message', handleNewMessage);
        };
    }, [socket]);

    const handleSelectChat = (chat) => {
        setActiveChat(chat);
        setMobileShowChat(true);
    };

    const handleCloseChat = () => {
        setMobileShowChat(false);
    };

    const handleNewChat = async (selectedUser) => {
        try {
            const response = await chatAPI.createChat(selectedUser._id);
            const newChat = response.data.chat;

            // Check if chat already exists in list
            const exists = chats.find(c => c._id === newChat._id);
            if (!exists) {
                setChats(prev => [newChat, ...prev]);
            }

            setActiveChat(newChat);
            setMobileShowChat(true);
        } catch (error) {
            console.error('Failed to create chat:', error);
        }
    };

    return (
        <div className="h-[100dvh] flex bg-dark-400">
            {/* Sidebar */}
            <div className={`
        w-full md:w-80 lg:w-96 flex-shrink-0
        ${mobileShowChat ? 'hidden md:flex' : 'flex'}
        flex-col
      `}>
                {/* Logout button */}
                <div className="absolute top-4 right-4 md:right-auto md:left-64 lg:left-80 z-10">
                    <button
                        onClick={logout}
                        className="p-2 rounded-lg bg-dark-200 hover:bg-dark-100 text-gray-400 hover:text-white transition-colors"
                        title="Logout"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>

                <ChatList
                    chats={chats}
                    activeChat={activeChat}
                    onSelectChat={handleSelectChat}
                    onNewChat={() => setShowNewChat(true)}
                    onOpenProfile={() => setShowProfile(true)}
                    currentUser={user}
                />
            </div>

            {/* Chat window */}
            <div className={`
        flex-1 flex
        ${mobileShowChat ? 'flex' : 'hidden md:flex'}
      `}>
                <ChatWindow
                    chat={activeChat}
                    currentUser={user}
                    onClose={handleCloseChat}
                />
            </div>

            {/* New chat modal */}
            <NewChatModal
                isOpen={showNewChat}
                onClose={() => setShowNewChat(false)}
                onSelectUser={handleNewChat}
            />

            {/* Profile modal */}
            <ProfileModal
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
            />
        </div>
    );
}
