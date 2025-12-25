const express = require("express");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai");
const nodemailer = require("nodemailer");
const { error } = require("console");
const fs = require("fs").promises;
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

require("dotenv").config();

const app = express();

app.use(cors());

app.use((req, res, next) => {
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use(express.json());

// Middleware פשוט לבדיקה (לדוגמה)
app.use((req, res, next) => {
  // כאן אפשר לבדוק JWT או סשן משתמש
  const authorized = true; // לשם הדגמה
  if (!authorized) return res.status(403).send("Forbidden");
  next();
});

// הגדרות S3
const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET_NAME = "myawsbucketgrinsh";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// הפונקציה מחזירה אובייקט שמכיל 3 שדות:
// 1 - כמה פרקים הושלמו
// 2 - כמה אחוז מהקורס הושלם
// 3 - כמה אחוז לא הושלם 
app.get('/api/users/:userId/courses/:courseId', async (req, res) => {
  const userId = req.params.userId;
  const courseId = req.params.courseId;
  try {
    const data = require('./data/users.json');
    const users = data.users;
    const user = users.find(u => u.id === Number(userId));
    if (!user)
      return res.status(404).json({
        error: " user not found"
      })
    const dataCourses = require('./data/courses.json').courses;
    const course = dataCourses.find(c => c.id === Number(courseId))
    if (!course)
      return res.status(404).json({
        error: " course not found"
      })
    const submissionsForCourse = user.marks.filter(
      mark => mark.courseId === Number(courseId)
    );

    const numberOfSubbmitions = (submissionsForCourse.length === 0) ? 0 : submissionsForCourse.length;
    const numberOfChapters = course.chapters.length;
    const percentDone = (numberOfSubbmitions * 100) / numberOfChapters;
    const percentToDo = 100 - percentDone;
    res.json(
      {
        "numberOfSubbmitions": numberOfSubbmitions,
        "percentDone": percentDone,
        "percentToDo": percentToDo
      }
    );
  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: "failed to fetch the number of subbmitions"
    })
  }
})



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

// בדיקה אם המשתמש הגיש כבר מטלה 
app.post("/api/check-submission", async (req, res) => {
  console.log(' בדיקה אם המשתמש הגיש כבר מטלה ');
  const { userId, courseId, chapterId } = req.body;
  const users = require('./data/users.json').users;
  const user = users.find(u => u.id === Number(userId))
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const isExistMark = user.marks.find(mark => mark.courseId === Number(courseId) &&
    mark.chapterId === Number(chapterId))
  if (isExistMark)
    res.send({ isSubmitted: true })
  else
    res.send({ isSubmitted: false })
})

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
    const schools = require("./data/schools.json");
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



app.get("/api/videos/:filename(*)", async (req, res) => {
  const { filename } = req.params;

  console.log("proxy video request:", filename);
  try {
    const s3Object = await s3.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
      })
    );

    // כותרות פשוטות – בלי Range
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Accept-Ranges", "none");

    // סטרימינג מהשרת ללקוח
    s3Object.Body.pipe(res);
  } catch (err) {
    console.error("video proxy error:", err);

    // אם נטפרי חסם – שליחת iframe שמחקה את דף החסימה
    if (err?.$metadata?.httpStatusCode === 418 && err?.body?.iframe?.src) {
      const iframeSrc = err.body.iframe.src;
      res.status(418).send(`
        <!DOCTYPE html>
        <html lang="he" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>וידאו חסום</title>
          <style>
            body, html { margin:0; padding:0; height:100%; }
            iframe { position:fixed; top:0; left:0; width:100%; height:100%; border:none; }
          </style>
        </head>
        <body>
          <iframe src="${iframeSrc}" id="netfree_block_iframe" name="netfree-block-iframe"></iframe>
        </body>
        </html>
      `);
      return;
    }

    res.status(500).send("Failed to load video");
  }
});


// 📧 שליחת משוב למנהל המערכת
app.post("/api/send-feedback", async (req, res) => {
  const { userName, schoolName, courseName, chapterName, subject, message } = req.body;

  try {
    // בדיקת שדות חובה
    if (!userName || !subject || !message) {
      return res.status(400).json({ 
        error: "יש למלא את כל השדות החובה" 
      });
    }

    // בדירוג אם יש כתובת מנהל במשתנים הסביבה
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `📢 משוב מהמערכת - ${subject}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; border-bottom: 3px solid #6366f1; padding-bottom: 10px;">📬 משוב חדש מהמערכת</h2>
            
            <div style="margin-top: 20px;">
              <h3 style="color: #666; margin-top: 15px; margin-bottom: 5px;">👤 פרטי המשתמש</h3>
              <p style="background-color: #f9f9f9; padding: 10px; border-radius: 4px; margin: 0;">
                <strong>שם:</strong> ${userName}
              </p>
              <p style="background-color: #f9f9f9; padding: 10px; border-radius: 4px; margin: 5px 0 0 0;">
                <strong>בית ספר:</strong> ${schoolName || "לא צוין"}
              </p>
              
              ${courseName ? `
              <h3 style="color: #666; margin-top: 15px; margin-bottom: 5px;">📚 פרטי הקורס</h3>
              <p style="background-color: #f9f9f9; padding: 10px; border-radius: 4px; margin: 0;">
                <strong>קורס:</strong> ${courseName}
              </p>
              ${chapterName ? `
              <p style="background-color: #f9f9f9; padding: 10px; border-radius: 4px; margin: 5px 0 0 0;">
                <strong>פרק:</strong> ${chapterName}
              </p>
              ` : ""}
              ` : ""}
              
              <h3 style="color: #666; margin-top: 15px; margin-bottom: 5px;">📝 הנושא</h3>
              <p style="background-color: #fff3cd; padding: 10px; border-radius: 4px; margin: 0; border-right: 4px solid #ffc107;">
                <strong>${subject}</strong>
              </p>
              
              <h3 style="color: #666; margin-top: 15px; margin-bottom: 5px;">💬 הפירוט</h3>
              <p style="background-color: #f9f9f9; padding: 10px; border-radius: 4px; margin: 0; line-height: 1.6; white-space: pre-wrap;">
                ${message}
              </p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
              <p>הודעה זו נשלחה באופן אוטומטי מהמערכת בתאריך ${new Date().toLocaleString('he-IL')}</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ 
      success: true, 
      message: "ההודעה נשלחה בהצלחה למנהל המערכת" 
    });
    
  } catch (error) {
    console.error("Feedback email error:", error);
    res.status(500).json({ 
      error: "שגיאה בשליחת המשוב" 
    });
  }
});

// Serve React static files from client/build
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});
// const PORT = process.env.PORT || 5000;
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
