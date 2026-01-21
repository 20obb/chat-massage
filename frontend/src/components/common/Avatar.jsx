/**
 * Avatar Component
 * Displays user avatar with online indicator
 */
export default function Avatar({
    email,
    size = 'md',
    isOnline = false,
    showStatus = true,
    className = ''
}) {
    // Get initials from email
    const getInitials = (email) => {
        const name = email.split('@')[0];
        return name.charAt(0).toUpperCase();
    };

    // Generate consistent color from email
    const getColor = (email) => {
        const colors = [
            'bg-gradient-to-br from-pink-500 to-rose-500',
            'bg-gradient-to-br from-violet-500 to-purple-500',
            'bg-gradient-to-br from-blue-500 to-cyan-500',
            'bg-gradient-to-br from-green-500 to-emerald-500',
            'bg-gradient-to-br from-yellow-500 to-orange-500',
            'bg-gradient-to-br from-teal-500 to-cyan-500',
            'bg-gradient-to-br from-indigo-500 to-blue-500',
            'bg-gradient-to-br from-red-500 to-pink-500',
        ];

        const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-2xl',
    };

    const statusSizeClasses = {
        sm: 'w-2.5 h-2.5 border-[1.5px]',
        md: 'w-3 h-3 border-2',
        lg: 'w-3.5 h-3.5 border-2',
        xl: 'w-4 h-4 border-2',
    };

    return (
        <div className={`relative flex-shrink-0 ${className}`}>
            {/* Avatar circle */}
            <div
                className={`
          ${sizeClasses[size]} 
          ${getColor(email)}
          rounded-full flex items-center justify-center font-semibold text-white
          shadow-lg
        `}
            >
                {getInitials(email)}
            </div>

            {/* Online status indicator */}
            {showStatus && (
                <div
                    className={`
            absolute bottom-0 right-0 rounded-full border-dark-300
            ${statusSizeClasses[size]}
            ${isOnline ? 'bg-green-500' : 'bg-gray-500'}
          `}
                />
            )}
        </div>
    );
}
