import { Loader } from "lucide-react";
import { CourseCard } from "../components/courses/CourseCard";

export const DashboardPage = ({ user, onSelectCourse, courses, loading }) => {
    const userCourses = courses.filter((c) => user?.courses?.includes(c.id));
    if (!userCourses.length) {
        console.log("there are no courses available for this student...");
    }
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