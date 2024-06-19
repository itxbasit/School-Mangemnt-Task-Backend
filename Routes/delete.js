import express from 'express'
import Teacher from '../Schema/teacher.js'
import Courses from '../Schema/courses.js'
import Classes from '../Schema/classes.js'
import Students from '../Schema/Student.js'
import CodeDecoder from '../Services/codeDecoder.js';
import verifySecretToken from '../Services/verifySecretToken.js';

const router = express.Router()

router.delete('/teacherCourse/:courseId', async (req, res) => {
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
        const { id: teacherId } = CodeDecoder(token);
        
        // Extract the course objectId from request parameters
        const { courseId: objectId } = req.params;

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ status: 404, message: 'Teacher not found' });
        }

        // Find the course by its objectId
        const course = await Courses.findById(objectId);
        if (!course) {
            return res.status(404).json({ status: 404, message: 'Course not found' });
        }

        const checkEnrolled = course.teachersEnrolled.some(enrolledTeacherId => (enrolledTeacherId.teacherId.toString() == teacherId));
        if (!checkEnrolled) {
            return res.status(400).json({ status: 400, message: `Teacher isn't enrolled` });
        }

        teacher.courseEnrolled = teacher.courseEnrolled.filter(course => course.courseId.toString() != objectId);

        // Remove the teacherId from the course's teachersEnrolled array
        course.teachersEnrolled = course.teachersEnrolled.filter(teacher => teacher.teacherId.toString() != teacherId);

        // Save the updated teacher and course documents
        await teacher.save();
        await course.save();


        // Respond with success
        return res.status(200).json({ status: 200, message: 'Unenrolled Successfully' });

    } catch (error) {
        // Handle errors and send a response
        return res.status(500).json({ status: 500, message: error.message });
    }
})

router.delete('/studentCourse/:courseId', async (req, res) => {
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
        const { id: studentId } = CodeDecoder(token);
        
        // Extract the course objectId from request parameters
        const { courseId: objectId } = req.params;

        const student = await Students.findById(studentId);
        if (!student) {
            return res.status(404).json({ status: 404, message: 'Student not found' });
        }

        // Find the course by its objectId
        const course = await Courses.findById(objectId);
        if (!course) {
            return res.status(404).json({ status: 404, message: 'Course not found' });
        }

        const checkEnrolled = course.studentsEnrolled.some(enrolledTeacherId => (enrolledTeacherId.studentId.toString() == studentId));
        if (!checkEnrolled) {
            return res.status(400).json({ status: 400, message: `Student isn't enrolled` });
        }

        student.courseEnrolled = student.courseEnrolled.filter(course => course.courseId.toString() != objectId);

        // Remove the teacherId from the course's teachersEnrolled array
        course.studentsEnrolled = course.studentsEnrolled.filter(student => student.studentId.toString() != studentId);

        // Save the updated teacher and course documents
        await student.save();
        await course.save();


        // Respond with success
        return res.status(200).json({ status: 200, message: 'Unenrolled Successfully' });

    } catch (error) {
        // Handle errors and send a response
        return res.status(500).json({ status: 500, message: error.message });
    }
})

router.delete('/classCourse/:courseId/:classId', async (req, res) => {
    try {
        
        const { courseId, classId } = req.params;

        const classDocument = await Classes.findById(classId);
        if (!classDocument) {
            return res.status(404).json({ status: 404, message: 'Class not found' });
        }

        // Remove the courseId from the class's courseEnrolled array
        classDocument.courseEnrolled = classDocument.courseEnrolled.filter(course => course.courseId.toString() !== courseId);
        
        // Save the updated class document
        await classDocument.save();

        // Find all students enrolled in the class
        const students = await Students.find({ classId: classId });

        // Remove the courseId from each student's courseEnrolled array
        for (let student of students) {
            student.courseEnrolled = student.courseEnrolled.filter(course => course.courseId.toString() !== courseId);
            await student.save();
        }

        // Find the course by courseId
        const course = await Courses.findById(courseId);
        if (course) {
            // Remove the class's students from the course's studentsEnrolled array
            for (let student of students) {
                course.studentsEnrolled = course.studentsEnrolled.filter(enrollment => enrollment.studentId.toString() !== student._id.toString());
            }
            await course.save();
        }

        // Respond with success
        return res.status(200).json({ status: 200, message: 'Unenrolled Successfully' });

    } catch (error) {
        // Handle errors and send a response
        return res.status(500).json({ status: 500, message: error.message });
    }
})

export default router