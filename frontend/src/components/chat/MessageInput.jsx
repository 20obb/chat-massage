import { useState, useRef, useEffect } from 'react';

/**
 * MessageInput Component
 * Text input with send button
 */
export default function MessageInput({ onSend, onTyping, disabled }) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [message]);

    const handleChange = (e) => {
        setMessage(e.target.value);

        // Handle typing indicator
        if (onTyping) {
            onTyping(true);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set new timeout to stop typing indicator
            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false);
            }, 1000);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedMessage = message.trim();
        if (!trimmedMessage || disabled) return;

        onSend(trimmedMessage);
        setMessage('');

        // Stop typing indicator
        if (onTyping) {
            onTyping(false);
        }

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e) => {
        // Submit on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-dark-300 border-t border-dark-200">
            <div className="flex items-end gap-3">
                {/* Message input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={disabled}
                        rows={1}
                        className="w-full bg-dark-200 border border-dark-100 rounded-2xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none max-h-32 transition-colors"
                    />
                </div>

                {/* Send button */}
                <button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className={`
            p-3 rounded-xl transition-all duration-200
            ${message.trim()
                            ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-dark-200 text-gray-500 cursor-not-allowed'}
          `}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </form>
    );
}
