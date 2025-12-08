
import React, { useState, useEffect, createContext, useContext } from "react";
import {
  ChevronRight,
  Play,
  Code,
  Send,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// 📦 API Service
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
//const API_URL = 'https://autodidact.co.il';

const apiService = {
  getUsers: async () => {
    const res = await fetch(`${API_URL}/api/users`);
    return res.json();
  },

  getCourses: async () => {
    const res = await fetch(`${API_URL}/api/courses`);
    return res.json();
  },

  getSchools: async () => {
      const res = await fetch(`${API_URL}/api/schools`);
      const data = await res.json();
      return data;
  },
  login: async(schoolCode, username) => {
    const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolCode, username })
      });

    const data = await res.json();
    return { ok: res.ok, data};
  },

  checkAssignment: async (code, assignment, studentName, studentEmail) => {
    const res = await fetch(`${API_URL}/api/check-assignment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, assignment, studentName, studentEmail }),
    });
    if (!res.ok) throw new Error("Failed to check assignment");
    return res.json();
  },

  submitAssignment: async (
    studentName,
    studentEmail,
    courseName,
    chapterTitle,
    grade,
    feedback
  ) => {
    const res = await fetch(`${API_URL}/api/submit-assignment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName,
        studentEmail,
        courseName,
        chapterTitle,
        grade,
        feedback,
      }),
    });
    if (!res.ok) throw new Error("Failed to submit assignment");
    return res.json();
  },
};

// 🎯 דף הכניסה החדש — בחירת בית ספר + שם משתמש + התחברות
const  LoginPage = ({ onLogin, loading }) => {
  const [schools, setSchools] = useState([]);
  const [schoolCode, setSchoolCode] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  // טעינת רשימת בתי ספר
  useEffect(() => {
  const fetchSchools = async () => {
    try {
      const data = await apiService.getSchools();
      setSchools(data);
    } catch (err) {
      console.error(err);
      setError("שגיאה בטעינת בתי הספר");
    }
  };

  fetchSchools();
}, []);

  // התחברות
  const handleLogin = async () => {
    setError("");

    if (!schoolCode || !username.trim()) {
      setError("נא למלא את כל השדות");
      return;
    }

    try {
      const { ok, data } = await apiService.login(schoolCode, username.trim());

      if (!ok) {
        setError(data.error || "שגיאה בהתחברות");
        return;
      }
      // שולחים את ה-user שהגיע מהשרת ל-App
      onLogin(data.user);

    } catch (err) {
      console.error(err);
      setError("תקלה בשרת");
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">🎵 Vibe-Coding</h1>
          <p className="text-gray-600">התחברות למערכת הלמידה</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* בחירת בית ספר */}
        <div className="mb-5">
          <label className="font-semibold">בחרי בית ספר:</label>
          <select
            className="w-full mt-2 border p-2 rounded-lg"
            value={schoolCode}
            onChange={(e) => setSchoolCode(e.target.value)}
          >
            <option value="">-- בחרי --</option>
            {schools.map((school) => (
              <option key={school.code} value={school.code}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        {/* שם משתמש */}
        <div className="mb-5">
          <label className="font-semibold">שם המשתמש (שם התלמידה):</label>
          <input
            type="text"
            className="w-full mt-2 border p-2 rounded-lg"
            placeholder="הקלידי את שמך..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* כפתור התחברות */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:scale-105 transition"
        >
          התחברות
        </button>
      </div>
    </div>
  );
};


// 📚 דף הקורסים
const DashboardPage = ({ user, onSelectCourse, courses, loading }) => {
  const userCourses = courses.filter((c) => user.courses.includes(c.id));

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ברוכה בחזרה, {user.name}! 👋
          </h1>
          <p className="text-gray-600">בחרי קורס כדי להמשיך</p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition transform hover:scale-105"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {course.name}
                </h2>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="flex items-center text-purple-600 font-semibold">
                  <span>{course.chapters.length} פרקים</span>
                  <ChevronRight className="w-5 h-5 mr-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 📖 דף הקורס
const CoursePage = ({ user, course, onSelectChapter, onBack, courses }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
        >
          ← חזרה לקורסים
        </button>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">{course.name}</h1>
        <p className="text-gray-600 mb-8">{course.description}</p>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 הפרקים:</h2>
        <div className="space-y-4">
          {course.chapters.map((chapter, idx) => (
            <div
              key={chapter.id}
              onClick={() => onSelectChapter(chapter)}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition transform hover:translate-x-1"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {chapter.title}
                  </h3>
                  <p className="text-gray-600">{chapter.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 📝 דף הפרק
const ChapterPage = ({ user, chapter, course, onBack }) => {
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
      const result = await apiService.checkAssignment(
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
      await apiService.submitAssignment(
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
                <video
                  width="100%"
                  height="300"
                  controls
                  className="rounded-lg bg-black"
                >
                  <source src={video.url} type="video/mp4" />
                  הדפדפן שלך לא תומך בסרטוני HTML5
                </video>
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
          <p className="text-gray-600 mb-6">{chapter.assignment.description}</p>

          <div className="bg-gray-900 text-white rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-400 mb-2">הכניסו את הקוד שלכם:</p>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={submitted}
              className="w-full bg-gray-800 text-white p-4 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              rows="8"
              placeholder="הדביקו את הקוד כאן..."
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

// 🎯 App הראשי
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("login");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiService.getCourses();
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentPage("dashboard");
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setCurrentPage("course");
  };

  const handleSelectChapter = (chapter) => {
    setSelectedChapter(chapter);
    setCurrentPage("chapter");
  };

  const handleBack = () => {
    if (currentPage === "chapter") {
      setCurrentPage("course");
    } else if (currentPage === "course") {
      setCurrentPage("dashboard");
    }
  };

  return (
    <div>
      {currentPage === "login" && (
        <LoginPage onLogin={handleLogin} loading={loading} />
      )}
      {currentPage === "dashboard" && (
        <DashboardPage
          user={currentUser}
          onSelectCourse={handleSelectCourse}
          courses={courses}
          loading={loading}
        />
      )}
      {currentPage === "course" && (
        <CoursePage
          user={currentUser}
          course={selectedCourse}
          onSelectChapter={handleSelectChapter}
          onBack={handleBack}
          courses={courses}
        />
      )}
      {currentPage === "chapter" && (
        <ChapterPage
          user={currentUser}
          chapter={selectedChapter}
          course={selectedCourse}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
