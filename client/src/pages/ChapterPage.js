import React, { useState } from "react";
import {checkIfSubmitted, checkAssignment, saveMark, submitAssignment} from "../api/apiService";
import { AlertCircle, CheckCircle, Code, Loader, Play } from "lucide-react";
import { VideoPlayer } from "../components/common/VideoPlayer";

export const ChapterPage = ({ user, chapter, course, onBack }) => {



  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckAssignment = async () => {
    if (!code.trim()) {
      alert("אנא הכניסו קוד להערכה");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const isExistSubmission = await checkIfSubmitted(
        user.id,
        course.id,
        chapter.id
      );
      if (isExistSubmission.isSubmitted) {
        alert("הגשת כבר את המטלה לפרק זה, אין באפשרותך להגיש פעם נוספת ! ");
        return;
      }
      const result = await checkAssignment(
        code,
        chapter.assignment.description,
        user.name,
        user.email
      );
      console.log("result of check assignment", result);

      setFeedback(result);
    } catch (err) {
      setError("שגיאה בבדיקת הקוד: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFinal = async () => {
    if (!feedback) {
      alert("יש לבדוק את הקוד תחילה");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // call to function un server that write the mark to the file
      const saveMarkResponse = await saveMark(
        user.id,
        course.id,
        chapter.id,
        feedback.grade,
        feedback.feedback
      );
      console.log(saveMarkResponse);
      // call to the function in apiService in order to send email to the student
      await submitAssignment(
        user.name,
        user.email,
        course.name,
        chapter.title,
        feedback.grade,
        feedback.feedback
      );
      setSubmitted(true);
      alert(
        `✅ המטלה הוגשה בהצלחה!\n\nציון: ${feedback.grade}/100\n\nמייל אישור יישלח ל${user.email}`
      );
    } catch (err) {
      setError("שגיאה בהגשת המטלה: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
        >
          ← חזרה ל{course.name}
        </button>


        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          {chapter.title}
        </h1>
        <p className="text-gray-600 mb-8">{chapter.description}</p>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 ml-2" />
              {error}
            </div>
          </div>
        )}

        {/* 🎥 סרטונים */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Play className="w-6 h-6 mr-2 text-purple-600" /> סרטונים
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {chapter.videos.map((video, idx) => (
              <div key={idx} className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2 font-semibold">
                  {video.title}
                </p>
                <VideoPlayer filename={video.url} />
              </div>
            ))}
          </div>
        </div>

        {/* 📋 המטלה */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 המטלה</h2>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            {chapter.assignment.title}
          </h3>
          <pre className="text-gray-600 mb-6">
            {chapter.assignment.description}
          </pre>

          <div className="bg-gray-900 text-white rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-400 mb-2">הכניסו את הקוד שלכם:</p>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={submitted}
              className="w-full bg-gray-800 text-white p-4 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              rows="8"
              placeholder=" paste your code here  ..."
              style={{ direction: "ltr" }}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCheckAssignment}
              disabled={loading || submitted}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Code className="w-5 h-5" />
              )}
              בדיקה עם AI
            </button>

            {feedback && (
              <button
                onClick={handleSubmitFinal}
                disabled={submitted || loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                <CheckCircle className="w-5 h-5" />
                הגשה סופית
              </button>
            )}
          </div>
        </div>

        {/* 💬 משוב */}
        {feedback && (
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg shadow-lg p-6 border-r-4 border-purple-600">
            <div className="flex items-start gap-4 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div className="w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  ✨ משוב ההערכה
                </h2>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">אחוז השלמה</p>
                      <p className="text-3xl font-bold text-green-600">
                        {feedback.completion_percentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ציון סופי</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {feedback.grade}/100
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-gray-800 mb-2">💬 משוב:</h3>
                  <p className="text-gray-700">{feedback.feedback}</p>
                </div>

                <div className="bg-white rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-gray-800 mb-2">
                    💡 הצעות לשיפור:
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {feedback.suggestions &&
                      feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">📝 הערות:</h3>
                  <p className="text-gray-700">{feedback.comments}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {submitted && (
          <div className="mt-8 bg-green-100 border-l-4 border-green-600 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" /> המטלה הוגשה בהצלחה! ✅
            </h3>
            <p className="text-green-700 mt-2">
              מייל אישור יישלח לכתובת שלך בעוד כמה רגעים.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};