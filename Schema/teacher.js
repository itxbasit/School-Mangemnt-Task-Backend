import mongoose, { mongo } from "mongoose";

const { Schema } = mongoose;

const courseSchema = new Schema({
    courseId: {
        type: Schema.Types.ObjectId,
        required: true
    },
});

const teacherSchema = new Schema({
    teacherName: {
        type: Schema.Types.String,
        required: true,
    },
    email: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    password: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    courseEnrolled: [courseSchema]
})

const User = mongoose.model('teachers', teacherSchema);

export default User;