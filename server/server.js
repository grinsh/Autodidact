
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const nodemailer = require('nodemailer');
const { error } = require('console');
const fs = require('fs').promises;
const path = require('path')
require('dotenv').config();

const app = express();
app.use(cors());
app.use((req, res, next) => {
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✉️ הגדרת nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// שמירת הציון בקובץ users.json
app.post("/api/save-mark", async (req, res) => {
  const { studentId, courseId, chapterId, grade, feedback } = req.body;

  try {
    const filePath = path.join(__dirname, "data", "users.json");
    const fileData = await fs.readFile(filePath, "utf-8");
    const usersData = JSON.parse(fileData);
    const date = new Date();
    console.log('filePath', filePath);

    const user = usersData.users.find((u) => u.id === Number(studentId));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log('user', user);
    const newMark = {
      courseId,
      chapterId,
      grade,
      feedback,
      date
    }
    user.marks.push(newMark);
    await fs.writeFile(filePath, JSON.stringify(usersData, null, 2));
    return res.json({ success: true });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch " });
  }
});

// 📌 בדיקת קוד עם OpenAI
app.post("/api/check-assignment", async (req, res) => {
  const { code, assignment, studentName, studentEmail } = req.body;

  try {
    const prompt = `אתה מורה לתכנות. בדוק את הקוד הבא לפי המטלה המוגדרת.

📝 המטלה: ${assignment}

💻 קוד התלמיד:
\`\`\`
${code}
\`\`\`

בדוק את הקוד וחזור בתשובה בפורמט JSON (בעברית) עם השדות הבאים:
1. "completion_percentage" - אחוז השלמת המטלה (0-100)
2. "feedback" - משוב קונסטרוקטיבי
3. "suggestions" - מערך מחרוזות - הצעות לתיקון
4. "grade" - ציון (1-100)
5. "comments" -מערך מחרוזות -  הערות כלליות

החזר ONLY JSON, ללא markdown.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to check assignment" });
  }
});

// 📧 שליחת מייל עם הציון הסופי
app.post("/api/submit-assignment", async (req, res) => {
  const {
    studentName,
    studentEmail,
    courseName,
    chapterTitle,
    grade,
    feedback,
  } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: `✅ המטלה שלך נבדקה - ${courseName}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>שלום ${studentName}! 👋</h2>
        <p>המטלה שלך בקורס <strong>${courseName}</strong> בפרק <strong>${chapterTitle}</strong> נבדקה.</p>
        
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>📊 הציון: <span style="color: green; font-size: 24px;">${grade}</span>/100</h3>
        </div>
        
        <h3>💬 משוב:</h3>
        <p>${feedback}</p>
        
        <p style="margin-top: 30px; color: #666;">
          אם יש לך שאלות, אתה מוזמן לפנות לצוות ההוראה.
        </p>
        
        <p>בהצלחה! 🚀</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// 📚 קבלת רשימת משתמשים
app.get("/api/users", (req, res) => {
  try {
    const users = require("./data/users.json");
    res.json(users.users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 📚 קבלת קורסים
app.get("/api/courses", (req, res) => {
  try {
    const courses = require("./data/courses.json");
    res.json(courses.courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// 📚 קבלת רשימת סמינרים
app.get("/api/schools", (req, res) => {
  try {
    const schools = require("./data/schools.json"); // נניח שיש לך קובץ schools.json
    res.json(schools);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch schools" });
  }
});

// 📚 קבלת תלמידים לפי סמינר
app.get("/api/school/:schoolId/students", (req, res) => {
  const schoolId = req.params.schoolId;
  console.log("schoolId is: ", schoolId);
  try {
    const users = require('./data/users.json');
    const filteredUsers = users.filter(user => user.schoolId === schoolId);
    res.json(filteredUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users for school" });
  }
});

// קבלת הציונים של תלמיד מסוים בקורס מסוים
app.get('/api/users/:userId/courses/:courseId/marks', (req, res) => {

  try {
    console.log(" GET /api/users/:userId/courses/:courseId/marks called!");
    const { userId, courseId } = req.params;
    console.log(" Params:", userId, courseId);
    const data = require('./data/users.json');
    const users = data.users;
    const user = users.find(u => u.id === Number(userId))
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const marks = user.marks.filter(mark => mark.courseId === Number(courseId))
    res.json(marks)
  }
  catch (error) {
    res.status(500).json({
      error: ' Failed to retrieve the students marks for the chapter'
    });
  }

})

// 🔑 התחברות לפי קוד בית ספר ושם משתמש
app.post("/api/login", (req, res) => {
  const { schoolCode, username } = req.body;
  try {
    const schools = require("./data/schools.json");
    const school = schools.find((s) => s.code === schoolCode);

    const { users } = require("./data/users.json");
    const user = users.find(
      (u) => u.name == username && u.schoolCode === school.code
    );
    if (school && user) {
      return res.json({
        success: true,
        message: "Login successful",
        user,
      });
    }
    return res.status(400).json({
      error: "Invalid school code or username",
    });
  } catch (error) {
    console.log("Login error: ", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// 📁 שיתוף קבצי וידאו סטטיים
app.use("/videos", express.static("public/videos"));

const buildPath = path.join(__dirname, "..", "client", "build");

// שירות קבצים סטטיים
app.use(express.static(buildPath));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// const PORT = process.env.PORT || 5000;
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
