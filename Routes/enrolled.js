import express from 'express'
import Teacher from '../Schema/teacher.js'
import Courses from '../Schema/courses.js'
import Classes from '../Schema/classes.js'
import Students from '../Schema/Student.js'
import CodeDecoder from '../Services/codeDecoder.js';
import verifySecretToken from '../Services/verifySecretToken.js';

const router = express.Router()

router.post('/teacher/:courseId', async (req, res) => {
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
        const { courseId: objectId } = req.params;

        // Validate objectId here if necessary

        // Find the course by its objectId
        const course = await Courses.findById(objectId);
        if (!course) {
            return res.status(404).json({ status: 404, message: 'Course not found' });
        }

        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.status(404).json({ status: 404, message: 'Teacher not found' });
        }
        const teacherId = id;
        // Check if the teacher is already enrolled
        const isAlreadyEnrolled = course.teachersEnrolled.some(enrolledTeacherId => (enrolledTeacherId.teacherId.toString() == teacherId));
        if (isAlreadyEnrolled) {
            return res.status(400).json({ status: 400, message: 'You are already enrolled' });
        }
        if (course.teachersEnrolled.length != 0) {
            return res.status(400).json({ status: 400, message: 'Teacher is already assigned for this course' });
        }

        // Enroll the teacher
        course.teachersEnrolled.push({ teacherId });
        teacher.courseEnrolled.push({ courseId: course._id })
        // Save the updated course document
        await course.save();
        await teacher.save();

        // Respond with success
        return res.status(200).json({ status: 200, message: 'Enrolled Successfully' });

    } catch (error) {
        // Handle errors and send a response
        return res.status(500).json({ status: 500, message: error.message });
    }
})


router.post('/student/:courseId/', async (req, res) => {
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
        const { courseId: objectId, maxMarks } = req.params;

        // Validate objectId here if necessary

        // Find the course by its objectId
        const course = await Courses.findById(objectId);
        if (!course) {
            return res.status(404).json({ status: 404, message: 'Course not found' });
        }

        const student = await Students.findById(id);
        if (!student) {
            return res.status(404).json({ status: 404, message: 'student not found' });
        }
        const studentId = id;

        const studentClass = await Classes.findById(student.classId);
        if (!studentClass) {
            return res.status(404).json({ status: 404, message: 'Class not found' });
        }

        // Check if the course exists in the class's courseEnrolled array
        const isCourseInClass = studentClass.courseEnrolled.some(course =>
            course.courseId.toString() === objectId
        );
        if (!isCourseInClass) {
            return res.status(400).json({ status: 400, message: `This Course isn't availble for your class` });
        }

        // Check if the student is already enrolled
        const isAlreadyEnrolled = course?.studentsEnrolled?.some(enrolledStudentId => (enrolledStudentId.studentId.toString() == studentId));
        if (isAlreadyEnrolled) {
            return res.status(400).json({ status: 400, message: 'Student already enrolled' });
        }

        // Enroll the student
        course.studentsEnrolled.push({ studentId });
        student.courseEnrolled.push({ courseId: course._id, maxMarks })
        // Save the updated course document
        await course.save();
        await student.save();

        // Respond with success
        return res.status(200).json({ status: 200, message: 'Enrolled Successfully' });

    } catch (error) {
        // Handle errors and send a response
        return res.status(500).json({ status: 500, message: error.message });
    }
})

export default router