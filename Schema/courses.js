import mongoose, { mongo } from "mongoose";

const { Schema } = mongoose;

const teacherSchema = new Schema({
    teacherId: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

const studentSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        required: true
    }
});


const coursesSchema = new Schema({
    courseName: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    maxMarks: {
        type: Schema.Types.Number,
        required: true,
        default: 100,
    },
    teachersEnrolled: [teacherSchema],
    studentsEnrolled: [studentSchema],
})

const Courses = mongoose.model('Courses', coursesSchema);

export default Courses;