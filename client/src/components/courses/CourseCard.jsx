import React, { useState, useEffect, useMemo } from "react";
import {getStatistic} from "../../api/apiService";

export default CourseCard = ({ userId, course, onSelectCourse }) => {
  const [stat, setStat] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStatistic(userId, course.id);
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