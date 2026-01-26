const UserModel = require("../data/models/UserModel");

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

const addUser = async (req, res) => {
    const { id, name, email, courses, marks, schoolCode } = req.body;
    try {
        const newUser = new UserModel({
            id,
            name,
            email,
            courses,
            marks,
            schoolCode,
        });
        await newUser.save();
        res.json({ message: "משתמש נוסף בהצלחה ! ", user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json("failed to push user");
    }

}
module.exports = { getAllUsers, getUserById, addUser };