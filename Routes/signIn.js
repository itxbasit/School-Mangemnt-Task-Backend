import express from 'express';
import User from '../Schema/teacher.js';
import Students from '../Schema/Student.js';
import bcrypt from "bcrypt";
import createSecretToken from '../Services/createSecretToken.js';
import capitalizeUsername from '../Services/captalize.js';
        
const router = express.Router()

router.post("/teacher", async (req, res) => {
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const { password, teacherName } = req.body;
        const name = capitalizeUsername(teacherName)
        const emailVer = emailRegex.test(name)
        const email = emailVer ? teacherName : null
        const user = emailVer ? await User.findOne({ email }) : await User.findOne({ teacherName: name });
        if (!user) {
            return res.status(401).send({ status: 401, message: "user not found" })
        }
        const compare = await bcrypt.compare(password, user.password)
        if (!compare) {
            return res.status(403).send({ status: 403, message: "wrong password" })
        }
        const token = createSecretToken(user._id, user.email, user.teacherName)

        delete user._doc.password;
        return res.status(200).send({ status: 200, token, message: user })
    }
    catch (err) {
        return res.status(400).send({ status: 400, message: err.message })
    }
})

router.post("/student", async (req, res) => {
    try {
        const { password, rollNo } = req.body;
        const user = await Students.findOne({ rollNo });

        if (!user) {
            return res.status(401).send({ status: 401, message: "user not found" })
        }
        const compare = await bcrypt.compare(password, user.password)
        if (!compare) {
            return res.status(403).send({ status: 403, message: "wrong password" })
        }
        const token = createSecretToken(user._id, user.email, user.rollNo)

        delete user._doc.password;
        return res.status(200).send({ status: 200, token, message: user })
    }
    catch (err) {
        return res.status(400).send({ status: 400, message: err.message })
    }
})

export default router;