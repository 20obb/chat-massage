/**
 * MessageBubble Component
 * Individual message with timestamp and status
 */
export default function MessageBubble({ message, isOwn, showAvatar = false }) {
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
            <div
                className={`
          message-bubble
          ${isOwn ? 'message-sent' : 'message-received'}
        `}
            >
                {/* Message content */}
                <p className="break-words whitespace-pre-wrap">{message.content}</p>

                {/* Timestamp and status */}
                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                        {formatTime(message.createdAt)}
                    </span>

                    {/* Message status (for sent messages) */}
                    {isOwn && (
                        <span className="text-white/70">
                            {message.seen ? (
                                // Double check - seen
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                                </svg>
                            ) : (
                                // Single check - sent
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
