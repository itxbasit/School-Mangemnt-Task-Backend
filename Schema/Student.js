import mongoose, { mongo } from "mongoose";

const { Schema } = mongoose;

const courseSchema = new Schema({
    courseId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    marks: {
        type: Schema.Types.Number,
        required: true,
        default: 0
    }
});

const studentSchema = new Schema({
    studentName: {
        type: Schema.Types.String,
        required: true,
    },
    rollNo: {
        type: Schema.Types.String,
        required: true,
        unique: true,
    },
    password: {
        type: Schema.Types.String,
        required: true
    },
    classId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    courseEnrolled: [courseSchema],
})

const Students = mongoose.model('students', studentSchema);

export default Students;