import express from 'express'
import Teacher from '../Schema/teacher.js'
import Courses from '../Schema/courses.js'
import Classes from '../Schema/classes.js'
import Students from '../Schema/Student.js'
import bcrypt from "bcrypt";
import capitalizeUsername from '../Services/captalize.js'

const router = express.Router()


// Function to generate a random 6-digit number
function generateRandomRollNo() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to check if roll number exists
async function isRollNoUnique(rollNo) {
    const existingStudent = await Students.findOne({ rollNo });
    return !existingStudent;
}

router.post('/teacher', async (req, res) => {
    try {
        const { teacherName, email } = req.body;


        const password = await bcrypt.hash(`teacher4231${capitalizeUsername(teacherName)}`, 10)

        // Create a new group
        const teacher = new Teacher({
            teacherName: capitalizeUsername(teacherName),
            email,
            password
        });

        const savedGroup = await teacher.save();

        return res.status(200).send({ status: 200, message: savedGroup })
    } catch (error) {
        return res.status(500).send({ status: 500, message: error.message })
    }
})

router.post('/classes', async (req, res) => {
    try {
        const { className, courseEnrolled } = req.body;
        
        // Create a new group

        if (!Array.isArray(courseEnrolled)) {
            return res.status(400).send({ status: 400, message: 'courseEnrolled should be an array' });
        }

        // // Find courses that are available
        const availableCourses = await Courses.find({ _id: { $in: courseEnrolled } });
        
        // // Extract the IDs of available courses

        if (availableCourses.length !== courseEnrolled.length) {
            return res.status(404).send({ status: 404, message: 'Courses not found' });
        }

        const formattedCourseEnrolled = availableCourses.map(course => ({
            courseId: course._id
        }));


        const availableCourseIds = availableCourses.map(course => course._id.toString());
        const classes = new Classes({
            className: capitalizeUsername(className),
            courseEnrolled: formattedCourseEnrolled
        });

        const savedClasses = await classes.save();

        return res.status(200).send({ status: 200, message: savedClasses })
    } catch (error) {
        return res.status(500).send({ status: 500, message: error.message })
    }
})

router.post('/courses', async (req, res) => {
    try {
        const { courseName, maxMarks } = req.body;

        // Create a new group
        const courses = new Courses({
            courseName: capitalizeUsername(courseName),
            maxMarks
        });

        const savedCourses = await courses.save();

        return res.status(200).send({ status: 200, message: savedCourses })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 500, message: error.message })
    }
})

router.post('/students', async (req, res) => {
    try {
        const { studentName, className } = req.body;

        let rollNo;
        let isUnique = false;

        while (!isUnique) {
            rollNo = generateRandomRollNo();
            isUnique = await isRollNoUnique(rollNo);
        }

        const clas = await Classes.findOne({ className: capitalizeUsername(className) });

        if(!clas){
            return res.status(401).send({ status: 401, message: "Class not found" })
        }
        

        const password = await bcrypt.hash(`${rollNo}1234${capitalizeUsername(studentName)}`, 10)

        // Create a new group
        const students = new Students({
            studentName: capitalizeUsername(studentName),
            rollNo,
            classId: clas._id,
            password
        });

        const savedStudents = await students.save();

        return res.status(200).send({ status: 200, message: savedStudents })
    } catch (error) {
        return res.status(500).send({ status: 500, message: error.message })
    }
})

export default router