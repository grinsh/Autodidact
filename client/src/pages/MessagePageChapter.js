export const MessagePageChapter = ({ onBack }) => {
    return (
        <div
            className="min-h-screen bg-gray-50 flex items-center justify-center p-8"
            dir="rtl"
        >
            <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-md w-full text-center">
                <h1 className="text-4xl font-bold text-purple-600 mb-4">
                    ⚡ הפרק יעלה בקרוב!
                </h1>
                <p className="text-gray-600 text-lg mb-8">
                    הצוות שלנו עובד על זה — שווה לחזור לכאן בעוד כמה ימים 💜
                </p>

                <div className="flex justify-center">
                    <button
                        onClick={onBack}
                        className="
              bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-full shadow-md
              hover:from-purple-600 hover:to-blue-600 hover:shadow-lg hover:scale-105
              active:scale-95 transition-all duration-300 flex items-center justify-center gap-2
            "
                    >
                        <span className="text-lg">←</span>
                        <span>חזרה לקורס</span>
                    </button>
                </div>
            </div>
        </div>
    );
};