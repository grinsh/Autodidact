const express = require("express");
const dotenv = require("dotenv");
const { OAuth2Client } = require("google-auth-library");
const cors = require("cors");
const { createAccessToken, createRefreshToken } = require("./tokenUnits")

dotenv.config();
const router = express.Router();
// app.use(cors());

const client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
)

router.get("/google/url", (req, res) => {
    // url to connect to google 
    const url = client.generateAuthUrl({

        access_type: "offline", // מרענן את הטוקן של גוגל כדי להיות מחובר חאורך זמן
        scope: ["profile", "email"],
    });
    res.json({ url });
});

router.get("/google/callback", async (req, res) => {
    const code = req.query.code;
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const studentDetails = await client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo"
    })

    const googleUser = studentDetails.data;

    // בדיקה אם המשתמש קיים במערכת
    const users = require("../data/users.json").users;
    const user = users.find(u => u.email === googleUser.email);
    if (!user) {
        const refreshToken = createRefreshToken({ googleOnly: true });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/api/refresh",
        });

        return res.redirect("http://localhost:3000?googleLogin=true");
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/api/refresh"
    });

    res.redirect("http://localhost:3000?googleLogin=true");

})


module.exports.googleAuth = router;