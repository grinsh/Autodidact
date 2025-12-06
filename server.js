
const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✉️ הגדרת nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


// 📌 בדיקת קוד עם OpenAI
app.post('/api/check-assignment', async (req, res) => {
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
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to check assignment' });
  }
});

// 📧 שליחת מייל עם הציון הסופי
app.post('/api/submit-assignment', async (req, res) => {
  const { studentName, studentEmail, courseName, chapterTitle, grade, feedback } = req.body;

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
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// 📚 קבלת רשימת משתמשים
app.get('/api/users', (req, res) => {
  try {
    const users = require('./data/users.json');
    res.json(users.users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 📚 קבלת קורסים
app.get('/api/courses', (req, res) => {
  try {
    const courses = require('./data/courses.json');
    res.json(courses.courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// 📁 שיתוף קבצי וידאו סטטיים
app.use('/videos', express.static('public/videos'));


//שירות ריאקט סטטי
app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});


// const PORT = process.env.PORT || 5000;
const PORT =  5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));