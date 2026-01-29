import { Loader, Send } from "lucide-react";
import { useState } from "react";

export const FeedbackForm = ({ user, course, chapter, onClose }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!subject.trim() || !message.trim()) {
      setError("נא למלא את כל השדות");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/send-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: user.name,
          schoolName: user.schoolCode,
          courseName: course?.name || "",
          chapterName: chapter?.title || "",
          subject,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "שגיאה בשליחת המשוב");
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError("שגיאה בתקשורת עם השרת: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8 relative">
        {/* כפתור סגירה */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          ✕
        </button>

        {!submitted ? (
          <>
            <h2 className="text-3xl font-bold text-purple-600 mb-2">
              💬 משוב על המערכת
            </h2>
            <p className="text-gray-600 mb-6">
              אנא שתפי אתנו משוב, שאלה או בעיה שמנעה ממך להשתמש במערכת
            </p>

            {/* פרטי משתמש */}
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">📋 פרטיך:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">שם משתמש</p>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">בית ספר</p>
                  <p className="font-semibold text-gray-800">
                    {user.schoolCode}
                  </p>
                </div>
                {course && (
                  <div>
                    <p className="text-sm text-gray-600">קורס</p>
                    <p className="font-semibold text-gray-800">{course.name}</p>
                  </div>
                )}
                {chapter && (
                  <div>
                    <p className="text-sm text-gray-600">פרק</p>
                    <p className="font-semibold text-gray-800">
                      {chapter.title}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
                {error}
              </div>
            )}

            {/* שדה נושא */}
            <div className="mb-4">
              <label className="block text-gray-800 font-semibold mb-2">
                🏷️ נושא ההפניה *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="לדוגמה: שאלה, בעיה טכנית, הצעה..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* שדה פירוט */}
            <div className="mb-6">
              <label className="block text-gray-800 font-semibold mb-2">
                ✍️ פירוט *
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="בואי לנו בפרטים על מה שרוצה להגיד לנו..."
                rows="6"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                style={{ direction: "rtl" }}
              />
            </div>

            {/* כפתורים */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    שליחה...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    שלח משוב
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 disabled:bg-gray-300 transition"
              >
                ביטול
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              תודה על המשוב!
            </h3>
            <p className="text-gray-600">
              המשוב שלך נשלח בהצלחה ויעזור לנו לשפר את המערכת.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};