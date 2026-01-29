import React, { useState, useEffect } from "react";
import { getSchools,login}  from "../api/apiService";

export default LoginPage = ({ onLogin, loading }) => {
  const [schools, setSchools] = useState([]);
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  // טעינת רשימת בתי ספר
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await getSchools();
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
      const { ok, data } = await login(schoolCode, userName.trim());
      console.log('data from login: ', data)

      if (!ok) {
        setError(data.error || "שגיאה בהתחברות");
        return;
      }
      // שולחים את ה-user שהגיע מהשרת ל-App
      onLogin(data.user, data.accessToken);
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
        {/* התחברות עם גוגל */}
        <LoginWithGoogle />

      </div>
    </div>
  );
};