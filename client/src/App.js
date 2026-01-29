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
import axios from "axios";
import {LoginPage} from "./pages/LoginPage";
import {DashboardPage} from "./pages/DashbordPage";
import {CoursePage} from "./pages/CoursePage";
import {ChapterPage} from "./pages/ChapterPage";
import {MarksPage} from "./pages/MarkPage";
import {LogOutButtonWithFeedback} from "./components/common/LogOutButtonWithFeedback";
import {MessagePageChapter} from "./pages/MessagePageChapter";
import {NotRegisteredPage} from "./pages/NotRegisteredPage";
import {checkAssignment, checkIfSubmitted, fetchWithAuth, getCourses, getSchools, getStatistic, getUsers, login, logout, refreshToken, saveMark, setToken, setTokenAdapter, submitAssignment} from "./api/apiService";





// 🎯 App הראשי
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("login");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [googleAuthChecked, setGoogleAuthChecked] = useState(false)

  // redirect to the login page
  const handleLogOut = async () => {
    const res = await logout()
    console.log('logout by jwt sucsessed ? ', res);
    setAccessToken(null)
    setCurrentPage("login");
  };

  //login with AOuth (not need display - only login logic)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // אין Google OAuth → ממשיכים כרגיל
    if (!params.get("googleLogin")) {
      setGoogleAuthChecked(true);
      return;
    }

    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/api/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          setCurrentPage("NotRegisteredPage");
          setGoogleAuthChecked(true);
          return;
        }

        const data = await res.json();
        setToken(data.accessToken);
        setAccessToken(data.accessToken);

        const userRes = await fetch(`${API_URL}/api/me`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        });

        if (userRes.status === 401 || userRes.status === 404) {
          setCurrentPage("NotRegisteredPage");
          setGoogleAuthChecked(true);
          return;
        }

        const user = await userRes.json();
        setCurrentUser(user);
        setCurrentPage("dashboard");
        setGoogleAuthChecked(true);

      } catch (e) {
        console.error(e);
        setGoogleAuthChecked(true);
      }
    };

    run();
  }, []);


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    if (!accessToken) return;
    fetchCourses();
  }, [accessToken]);

  useEffect(() => {
    setTokenAdapter(setAccessToken);
  }, [])

  const handleLogin = (user, token) => {
    setToken(token);
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

  const hasGoogleLogin =
    new URLSearchParams(window.location.search).get("googleLogin");

  if (hasGoogleLogin && !googleAuthChecked) {
    return <div>בודקת התחברות עם Google…</div>;
  }

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
      {currentPage === "NotRegisteredPage" && (
        <NotRegisteredPage onBackToLogin={() => { setCurrentPage("login") }}
        />
      )

      }
    </div>
  );
}
