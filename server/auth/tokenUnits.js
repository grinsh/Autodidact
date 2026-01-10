const jwt = require("jsonwebtoken");

function createAccessToken(user) {
  return jwt.sign(
    { userId: user.id, userName: user.name },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { userId: user.id, userName: user.name },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
}

module.exports = { createAccessToken, createRefreshToken };
