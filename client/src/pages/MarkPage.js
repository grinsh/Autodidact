export default MarksPage = ({ user, course, onBack }) => {
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