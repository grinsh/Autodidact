export default CoursePage = ({
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