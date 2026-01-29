import { useState } from "react";
import { FeedbackForm } from "../auth/FeedbackForm";

export const LogOutButtonWithFeedback = ({ onLogOut, user, course, chapter }) => {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <button
          onClick={() => setShowFeedback(true)}
          className="
            flex items-center gap-2
            bg-gradient-to-r from-blue-500 to-cyan-500
            text-white
            px-4 py-2
            rounded-full
            font-semibold
            shadow-lg
            hover:from-blue-600 hover:to-cyan-600
            hover:scale-105
            transition
          "
          title="שלח משוב או בעיה"
        >
          💬 משוב
        </button>
        <button
          onClick={onLogOut}
          className="
            flex items-center gap-2
            bg-gradient-to-r from-red-500 to-pink-500
            text-white
            px-4 py-2
            rounded-full
            font-semibold
            shadow-lg
            hover:from-red-600 hover:to-pink-600
            hover:scale-105
            transition
          "
        >
          התנתקות
          <span className="text-lg">🚪</span>
        </button>
      </div>

      {showFeedback && (
        <FeedbackForm
          user={user}
          course={course}
          chapter={chapter}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </>
  );
};