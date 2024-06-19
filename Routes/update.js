import express from 'express'
import Teacher from '../Schema/teacher.js'
import Courses from '../Schema/courses.js'
import Classes from '../Schema/classes.js'
import Students from '../Schema/Student.js'
import CodeDecoder from '../Services/codeDecoder.js';
import verifySecretToken from '../Services/verifySecretToken.js';

const router = express.Router()

router.put('/classCourse/:courseId/:classId/:maxMarks', async (req, res) => {
    try {
        const { courseId, classId, maxMarks } = req.params;

        const classDocument = await Classes.findById(classId);

        if (!classDocument) {
            return res.status(404).json({ status: 404, message: 'Class not found' });
        }

        const course = await Courses.findById(courseId);
        if (!course) {
            return res.status(404).json({ status: 404, message: 'Class not found' });
        }

        const isAlreadyEnrolled = classDocument?.courseEnrolled?.some(enrolledId => (enrolledId.courseId.toString() == courseId));
        if (isAlreadyEnrolled) {
            return res.status(400).json({ status: 400, message: 'Course already enrolled' });
        }

        classDocument.courseEnrolled.push({ courseId: course._id, maxMarks })
        // Save the updated course document
        await classDocument.save();

        // Respond with success
        return res.status(200).json({ status: 200, message: 'Course Updated Successfully' });

    } catch (error) {
        // Handle errors and send a response
        return res.status(500).json({ status: 500, message: error.message });
    }
})

router.put('/marks/:courseId/:studentId/:marksObtained', async (req, res) => {
    try {
        // Extract token from headers
        const token = req.headers['token'];
        if (!token) {
            return res.status(400).json({ status: 400, message: 'Token is required' });
        }

        // Verify token and decode it
        const decode = verifySecretToken(token);
        if (!decode) {
            return res.status(401).json({ status: 401, message: 'Invalid token' });
        }

        // Decode the token to get teacher's ID
        const { id } = CodeDecoder(token);

        // Extract the course objectId from request parameters
        const { courseId,  studentId, marksObtained } = req.params;

        const marks = parseInt(marksObtained);

        if (isNaN(marks) || marks < 0) {
            return res.status(400).json({ status: 400, message: 'Invalid marks obtained' });
        }

        // Validate objectId here if necessary

        // Find the course by its objectId
        const course = await Courses.findById(courseId);
        if (!course) {
            return res.status(404).json({ status: 404, message: 'Course not found' });
        }

        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.status(404).json({ status: 404, message: 'Teacher not found' });
        }
        const teacherId = id;
        // Check if the teacher is already enrolled
        const checkedEnrolled = course.teachersEnrolled.some(enrolledTeacherId => (enrolledTeacherId.teacherId.toString() == teacherId));
        if (!checkedEnrolled) {
            return res.status(400).json({ status: 400, message: `You aren't enrolled in this course` });
        }

        // Find the student by id
        const student = await Students.findById(studentId);
        if (!student) {
            return res.status(404).json({ status: 404, message: 'Student not found' });
        }

        // Find the course in the student's courseEnrolled array
        const studentCourse = student.courseEnrolled.find(course => course.courseId.toString() === courseId);
        if (!studentCourse) {
            return res.status(400).json({ status: 400, message: 'Student is not enrolled in this course' });
        }


        // Check if the obtained marks are within the valid range
        if (marks > course.maxMarks) {
            return res.status(400).json({ status: 400, message: `Marks obtained cannot exceed the maximum marks of ${course.maxMarks}` });
        }

        // Update the marks
        studentCourse.marks = marks;

        // Save the updated student document
        await student.save();



        // Respond with success
        return res.status(200).json({ status: 200, message: 'Marks updated successfully' });

    } catch (error) {
        // Handle errors and send a response
        return res.status(500).json({ status: 500, message: error.message });
    }
})
export default router