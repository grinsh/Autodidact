import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  useMemo,
} from "react";
import {
  ChevronRight,
  Play,
  Code,
  Send,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import "./App.css";

// 📦 API Service
const API_URL = process.env.REACT_APP_API_URL;
const REACT_APP_VIDEOS_URL = process.env.REACT_APP_VIDEOS_URL;

// const API_URL = "https://autodidact.co.il";

const apiService = {
  getUsers: async () => {
    const res = await fetch(`${API_URL}/api/users`);
    return res.json();
  },

  getCourses: async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses`);
      return res.json();
    } catch (e) {
      throw e;
    }
  },

  getSchools: async () => {
    const res = await fetch(`${API_URL}/api/schools`);
    const data = await res.json();
    return data;
  },

  getUsers: async () => {
    const res = await fetch(`${API_URL}/api/users`);
    const data = await res.json();
    return data;
  },

  login: async (schoolCode, username) => {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolCode, username }),
    });

    const data = await res.json();
    return { ok: res.ok, data };
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
  getStatistic: async (userId, courseId) => {
    const res = await fetch(
      `${API_URL}/api/users/${userId}/courses/${courseId}`
    );
    return res.json();
  },
  // call to the function in the server that send email with the final mark
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

  // call the function in server that write the mark in the file .
  saveMark: async (studentId, courseId, chapterId, grade, feedback) => {
    const res = await fetch(`${API_URL}/api/save-mark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        courseId,
        chapterId,
        grade,
        feedback,
      }),
    });
    if (!res.ok) throw new Error("failed to save mark");
    return res.json();
  },
  checkIfSubmitted: async (userId, courseId, chapterId) => {
    const res = await fetch(`${API_URL}/api/check-submission`, {
      method: "POST",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        courseId,
        chapterId,
      }),
    });
    if (!res.ok) throw new Error("failed to check subbmition");
    return res.json();
  },
};

// 🎯 דף הכניסה החדש — בחירת בית ספר + שם משתמש + התחברות
const LoginPage = ({ onLogin, loading }) => {
  const [schools, setSchools] = useState([]);
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [userName, setUserName] = useState("");
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

  // כשהמשתמשת הכניסה קוד סמינר - אז שמים את שם הסמינר ב - state המתאים
  useEffect(() => {
    if (!schoolCode) {
      setSchoolCode("");
      return;
    }
    const school = schools.find(
      (sem) => String(sem.code) === String(schoolCode)
    );
    if (school) {
      setSchoolName(school.name);
    } else {
      return;
    }
  }, [schoolCode]);

  // התחברות
  const handleLogin = async () => {
    setError("");

    if (!schoolCode || !userName.trim()) {
      setError("נא למלא את כל השדות");
      return;
    }

    try {
      const { ok, data } = await apiService.login(schoolCode, userName.trim());

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
          <h1 className="text-4xl font-bold text-purple-600 mb-2">
            {" "}
            ברוכה הבאה !{" "}
          </h1>
          <p className="text-gray-600">התחברות למערכת הלמידה</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* בחירת סמינר */}

        <div className="mb-5">
          <label className="font-semibold">בחרי סמינר:</label>
          <input
            type="text"
            className="w-full mt-2 border p-2 rounded-lg"
            placeholder="הכניסי קוד סמינר"
            value={schoolCode}
            onChange={(e) => {
              const value = e.target.value;
              setSchoolCode(value);
              if (!value) setSchoolName("");
            }}
          />

          {/* הצגת שם סמינר מתחת לשדה */}
          {schoolName && (
            <p className="mt-2 text-sm text-purple-600 font-semibold">
              {schoolName}
            </p>
          )}
          {!schoolName && schoolCode && (
            <p className="mt-2 text-sm text-purple-600 font-semibold">
              קוד סמינר לא נכון
            </p>
          )}
        </div>

        {/* שם משתמש */}
        <div className="mb-5">
          <label className="font-semibold">שם המשתמש:</label>
          <input
            type="text"
            className="w-full mt-2 border p-2 rounded-lg"
            placeholder="הקלידי את שמך..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
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
            ברוכה הבאה, {user.name}! 👋
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
              <CourseCard
                key={course.id}
                userId={user.id}
                course={course}
                onSelectCourse={onSelectCourse}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// רכיב תצוגה שמראה את הסטטיסטיקה של קורס

const CourseCard = ({ userId, course, onSelectCourse }) => {
  const [stat, setStat] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getStatistic(userId, course.id);
        setStat(data);
      } catch (error) {
        console.error("שגיאה בטעינת סטטיסטיקה:", error);
      } finally {
        setLoading(false);
      }
    };

    if (course?.id && userId) {
      fetchStats();
    }
  }, [userId, course?.id]);

  if (!course) return null;

  // 🔒 המרות בטוחות
  const { percentDone, percentToDo, subCount } = useMemo(() => {
    return {
      percentDone: Number(stat?.percentDone) || 0,
      percentToDo: Number(stat?.percentToDo) || 0,
      subCount: Number(stat?.numberOfSubbmitions) || 0,
    };
  }, [stat]);

  const chaptersCount = Array.isArray(course.chapters)
    ? course.chapters.length
    : 0;

  const courseName =
    typeof course.name === "string"
      ? course.name
      : JSON.stringify(course.name ?? "");

  const courseDescription =
    typeof course.description === "string"
      ? course.description
      : JSON.stringify(course.description ?? "");

  const pieData = [
    { name: "בוצע", value: Number(stat?.percentDone) || 0 },
    { name: "נותר", value: Number(stat?.percentToDo) || 0 },
  ];

  return (
    <div
      onClick={() => onSelectCourse(course)}
      className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-100"
    >
      {/* 🏷 שם הקורס */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{courseName}</h2>

      {/* 🧾 תיאור הקורס */}
      <p className="text-gray-600 mb-4">{courseDescription}</p>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="w-6 h-6 text-purple-600 animate-spin" />
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-700 mb-3 text-center">
            פרקים שבוצעו:{" "}
            <span className="font-semibold text-purple-700">{subCount}</span>{" "}
            מתוך {chaptersCount}
          </p>

          <p className="text-center text-lg font-bold text-purple-700 mt-4">
            {percentDone}% הושלם
          </p>
        </>
      )}
    </div>
  );
};

// 📖 דף הקורס - מראה את הפרקים של הקורס המסוים
const CoursePage = ({
  user,
  course,
  onSelectChapter,
  onBack,
  courses,
  onShowMarks,
  onSelectChapterWithoutVideos,
}) => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* כפתור חזרה */}
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
        >
          ← חזרה לקורסים
        </button>

        {/* כותרת הקורס */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{course.name}</h1>
        <p className="text-gray-600 mb-8">{course.description}</p>

        {/* כפתור הציונים */}
        <button
          onClick={onShowMarks}
          className="mb-6 bg-blue-600 text-white px-4 py-2 rounded"
        >
          📊 הציונים שלי בקורס
        </button>

        {/* כפתור הנחיות */}
        {course.instructions && course.instructions.length > 0 && (
          <button
            onClick={() => setShowInstructions(true)}
            className="mb-6 ml-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            📖 הצג הנחיות עבודה
          </button>
        )}

        {/* רשימת פרקים */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 הפרקים:</h2>
        <div className="space-y-4">
          {course.chapters.map((chapter, idx) => (
            <div
              key={chapter.id}
              onClick={() => {
                if (!chapter.videos || chapter.videos.length === 0) {
                  onSelectChapterWithoutVideos();
                } else {
                  onSelectChapter(chapter);
                }
              }}
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

        {/* Modal להצגת הנחיות */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
              <h2 className="text-2xl font-bold mb-4">הנחיות עבודה</h2>
              <div className="max-h-96 overflow-y-auto">
                 <div className="max-h-96 overflow-y-auto space-y-4">
                {course.instructions.map((ins, idx) => (
                  <div key={idx}>
                    <h3 className="text-xl font-semibold mb-1">{ins.section}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{ins.content}</p>
                  </div>
                ))}
              </div>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
              >
                X
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 📝 דף הפרק - מראה את ההסרטות והמטלה של הפרק
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
      const isExistSubmission = await apiService.checkIfSubmitted(
        user.id,
        course.id,
        chapter.id
      );
      if (isExistSubmission.isSubmitted) {
        alert("הגשת כבר את המטלה לפרק זה, אין באפשרותך להגיש פעם נוספת ! ");
        return;
      }
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
      // call to function un server that write the mark to the file
      const saveMarkResponse = await apiService.saveMark(
        user.id,
        course.id,
        chapter.id,
        feedback.grade,
        feedback.feedback
      );
      console.log(saveMarkResponse);
      // call to the function in apiService in order to send email to the student
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

// 📺 עמוד הודעה — הפרק יעלה בקרוב
const MessagePageChapter = ({ onBack }) => {
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

        {/* קונטיינר שמרכז את הכפתור */}
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

const VideoPlayer = ({ filename, width = 640, height = 360 }) => {
  const videoRef = useRef(null);
  const [blockedHtml, setBlockedHtml] = useState(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const checkVideo = async () => {
      try {
        const response = await fetch(`${REACT_APP_VIDEOS_URL}/${filename}`);
        if (response.status === 418) {
          const htmlRaw = await response.text();
          const htmlClean = htmlRaw.replace(/<style[\s\S]*?<\/style>/gi, "");

          setFade(true);
          setTimeout(() => setBlockedHtml(htmlClean), 300);
        }
      } catch (err) {
        console.error("Error fetching video:", err);
      }
    };

    checkVideo();
  }, [filename]);

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {blockedHtml ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            opacity: fade ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
          dangerouslySetInnerHTML={{ __html: blockedHtml }}
        />
      ) : (
        <video
          ref={videoRef}
          controls
          width="100%"
          height="100%"
          style={{
            display: "block",
            opacity: fade ? 0 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <source
            // src={`${REACT_APP_VIDEOS_URL}/${filename}`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

const MarksPage = ({ user, course, onBack }) => {
  const courseMarks = user.marks.filter((m) => m.courseId === course.id);

  const getMarkForChapter = (chapterId) =>
    courseMarks.find((m) => m.chapterId === chapterId);
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6" dir="rtl">
      {/* כפתור חזרה */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition"
        >
          <span className="text-xl">←</span> חזרה לקורס
        </button>
      </div>

      {/* כותרת */}
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        ציונים – {course.name}
      </h1>

      {/* רשימת הציונים */}
      <div className="space-y-4">
        {course.chapters.map((chapter) => {
          const mark = getMarkForChapter(chapter.id);
          const gradeColor =
            mark?.grade >= 85
              ? "text-green-600"
              : mark?.grade >= 60
              ? "text-yellow-600"
              : "text-red-600";

          return (
            <div
              key={chapter.id}
              className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <strong className="text-lg text-gray-800">
                  {chapter.title}
                </strong>
                <span className={`font-semibold ${gradeColor}`}>
                  {mark ? `${mark.grade}/100` : "לא הוגש"}
                </span>
              </div>

              {mark && (
                <p className="text-gray-600 text-sm leading-relaxed border-t pt-2">
                  📝 {mark.feedback}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 💬 רכיב טופס משוב
const FeedbackForm = ({ user, course, chapter, onClose }) => {
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

const LogOutButtonWithFeedback = ({ onLogOut, user, course, chapter }) => {
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

// 🎯 App הראשי
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("login");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // redirect to the login page
  const handleLogOut = () => {
    setCurrentPage("login");
  };

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
    if (currentPage === "MessagePageChapter") {
      setCurrentPage("course");
    } else {
      if (currentPage === "chapter") {
        setCurrentPage("course");
      } else if (currentPage === "course") {
        setCurrentPage("dashboard");
      }
    }
  };

  const handleSeeMarks = () => {
    setCurrentPage("marks");
  };

  const handleSelectChapterWithoutVideos = () => {
    setCurrentPage("MessagePageChapter");
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
          onShowMarks={handleSeeMarks}
          onSelectChapterWithoutVideos={handleSelectChapterWithoutVideos}
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
      {currentPage === "marks" && (
        <MarksPage
          user={currentUser}
          course={selectedCourse}
          onBack={() => setCurrentPage("course")}
        />
      )}
      {currentPage !== "login" && (
        <LogOutButtonWithFeedback
          onLogOut={handleLogOut}
          user={currentUser}
          course={selectedCourse}
          chapter={selectedChapter}
        />
      )}
      {currentPage === "MessagePageChapter" && (
        <MessagePageChapter onBack={handleBack} />
      )}
    </div>
  );
}
