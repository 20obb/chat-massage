/**
 * Loading Component
 * Displays animated loading indicator
 */
export default function Loading({ text = 'Loading...', fullScreen = false }) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* Animated spinner */}
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-dark-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
            </div>

            {/* Loading text with dots animation */}
            <div className="text-gray-400 font-medium">
                <span>{text}</span>
                <span className="loading-dots inline-flex ml-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full mx-0.5"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                </span>
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-dark-400 flex items-center justify-center z-50">
                {content}
            </div>
        );
    }

    return content;
}
