import express from 'express'
import Teacher from '../Schema/teacher.js'
import Courses from '../Schema/courses.js'
import Classes from '../Schema/classes.js'
import Students from '../Schema/Student.js'
import capitalizeUsername from '../Services/captalize.js'

const router = express.Router()

router.get('/marks/:courseId/:studentId', async (req, res) => {

    const { courseId, studentId } = req.params;
    try {

        const student = await Students.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Find the enrolled course in the student document
        const enrolledCourse = student.courseEnrolled.find(course => course.courseId.toString() == courseId);

        if (!enrolledCourse) {
            return res.status(404).json({ message: 'Course not found for this student' });
        }

        // Fetch the course details by courseId
        const course = await Courses.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course details not found' });
        }

        // Prepare the response data
        const responseData = {
            studentName: student.studentName,
            courseName: course.courseName,
            TotalMarks: enrolledCourse.maxMarks,
            obtainedMarks: enrolledCourse.marks,
        };
        return res.status(200).json({ status: 200, message: responseData });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
})

router.get('/course', async (req, res) => {
    try {
        // Extract pagination and search parameters from query
        const { page = 1, limit = 10, search = '' } = req.query;

        // Convert page and limit to integers
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // Create a search filter if a search term is provided
        let searchFilter = {};
        if (search) {
            searchFilter = {
                courseName: { $regex: capitalizeUsername(search), $options: 'i' }  // Case-insensitive search
            };
        }

        // Calculate total count of documents that match the search filter
        const totalCount = await Courses.countDocuments(searchFilter);

        // Fetch the courses with pagination and search filter
        const courses = await Courses.find(searchFilter)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .exec();

        // Prepare the response data

        const detailedClasses = await Promise.all(courses.map(async (classObj) => {
            const studentsWithNames = await Promise.all(classObj.studentsEnrolled.map(async (studentsEnrolled) => {
                const student = await Students.findById(studentsEnrolled.studentId, 'studentName rollNo');
                return {
                    ...studentsEnrolled.toObject(),
                    studentName: student ? student.studentName : null,
                    rollNo: student ? student.rollNo : null
                };
            }));

            const teacherWithNames = await Promise.all(classObj.teachersEnrolled.map(async (teachersEnrolled) => {
                const teacher = await Teacher.findById(teachersEnrolled.teacherId, 'teacherName email');
                return {
                    ...teachersEnrolled.toObject(),
                    teacherName: teacher ? teacher.teacherName : null,
                    email: teacher ? teacher.email : null
                };
            }));

            return {
                ...classObj.toObject(),
                studentsEnrolled: studentsWithNames,
                teachersEnrolled: teacherWithNames
            };
        }));

        const responseData = {
            totalCount,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            courses: detailedClasses
        };

        // Send the response
        return res.status(200).json({ status: 200, message: "Courses retrieved successfully", data: responseData });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
})

router.get('/classes', async (req, res) => {
    try {
        // Extract pagination and search parameters from query
        const { page = 1, limit = 10, search = '' } = req.query;

        // Convert page and limit to integers
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // Create a search filter if a search term is provided
        let searchFilter = {};
        if (search) {
            searchFilter = {
                className: { $regex: capitalizeUsername(search), $options: 'i' }  // Case-insensitive search
            };
        }

        // Calculate total count of documents that match the search filter
        const totalCount = await Classes.countDocuments(searchFilter);

        // Fetch the courses with pagination and search filter
        const classes = await Classes.find(searchFilter)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .exec();

        // Prepare the response data
        const detailedClasses = await Promise.all(classes.map(async (classObj) => {
            const coursesWithNames = await Promise.all(classObj.courseEnrolled.map(async (courseEnrollment) => {
                const course = await Courses.findById(courseEnrollment.courseId, 'courseName');
                return {
                    ...courseEnrollment.toObject(),
                    courseName: course ? course.courseName : null
                };
            }));

            return {
                ...classObj.toObject(),
                courseEnrolled: coursesWithNames
            };
        }));

        // Prepare the response data
        const responseData = {
            totalCount,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            classes: detailedClasses
        };

        // Send the response
        return res.status(200).json({ status: 200, message: "Classes retrieved successfully", data: responseData });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
})

router.get('/teacher', async (req, res) => {
    try {
        // Extract pagination and search parameters from query
        const { page = 1, limit = 10, search = '' } = req.query;

        // Convert page and limit to integers
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);


        let searchFilter = {};
        if (search) {
            searchFilter = {
                teacherName: { $regex: capitalizeUsername(search), $options: 'i' }
            };
        }


        const totalCount = await Teacher.countDocuments(searchFilter);


        const classes = await Teacher.find(searchFilter)
            .select('-password')
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .exec();

        // Prepare the response data
        const detailed = await Promise.all(classes.map(async (classObj) => {
            const coursesWithNames = await Promise.all(classObj.courseEnrolled.map(async (courseEnrollment) => {
                const course = await Courses.findById(courseEnrollment.courseId, 'courseName');
                return {
                    ...courseEnrollment.toObject(),
                    courseName: course ? course.courseName : null
                };
            }));

            return {
                ...classObj.toObject(),
                courseEnrolled: coursesWithNames
            };
        }));

        // Prepare the response data
        const responseData = {
            totalCount,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            teachers: detailed
        };

        // Send the response
        return res.status(200).json({ status: 200, message: "Teachers retrieved successfully", data: responseData });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
})

router.get('/student', async (req, res) => {
    try {
        // Extract pagination and search parameters from query
        const { page = 1, limit = 10, search = '' } = req.query;

        // Convert page and limit to integers
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);


        let searchFilter = {};
        if (search) {
            searchFilter = {
                teacherName: { $regex: capitalizeUsername(search), $options: 'i' }
            };
        }


        const totalCount = await Students.countDocuments(searchFilter);


        const classes = await Students.find(searchFilter)
            .select('-password')
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .exec();

        // Prepare the response data
        const detailed = await Promise.all(classes.map(async (classObj) => {
            const coursesWithNames = await Promise.all(classObj.courseEnrolled.map(async (courseEnrollment) => {
                const course = await Courses.findById(courseEnrollment.courseId, 'courseName maxMarks');
                return {
                    ...courseEnrollment.toObject(),
                    courseName: course ? course.courseName : null,
                    maxMarks: course ? course.maxMarks : null
                };
            }));

            return {
                ...classObj.toObject(),
                courseEnrolled: coursesWithNames
            };
        }));

        // Prepare the response data
        const responseData = {
            totalCount,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            students: detailed
        };

        // Send the response
        return res.status(200).json({ status: 200, message: "Students retrieved successfully", data: responseData });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
})
export default router