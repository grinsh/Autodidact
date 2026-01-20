const UserModel = require("../models/UserModel");

const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "שגיאה בשליפת משתמשים" });
    }
}

const getUserById = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ error: "משתמש לא נמצא" });
        }
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "שגיאה: " + error });
    }
}

module.exports = { getAllUsers, getUserById };