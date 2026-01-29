export default NotRegisteredPage = ({ onBackToLogin }) => {
    return (
        <div
            className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4"
            dir="rtl"
        >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                {/* כותרת */}
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    אינך רשום במערכת
                </h1>

                {/* טקסט */}
                <p className="text-gray-600 mb-8 leading-relaxed">
                    ההתחברות באמצעות Google בוצעה בהצלחה,
                    <br />
                    אך לא נמצא משתמש תואם במערכת.
                    <br />
                    <br />
                    אם את/ה סבורה שמדובר בטעות,
                    <br />
                    אנא פנה/י למנהלת המערכת.
                </p>

                {/* כפתור */}
                <button
                    onClick={onBackToLogin}
                    className="
            w-full
            bg-gradient-to-r from-purple-500 to-blue-500
            text-white
            py-3
            rounded-lg
            font-semibold
            hover:from-purple-600 hover:to-blue-600
            hover:scale-105
            transition-all
          "
                >
                    חזרה למסך התחברות
                </button>
            </div>
        </div>
    );
};