import mongoose, { mongo } from "mongoose";

const { Schema } = mongoose;

const courseSchema = new Schema({
    courseId: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

const classSchema = new Schema({
    className: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    courseEnrolled: [courseSchema]
})

const Classes = mongoose.model('classes', classSchema);

export default Classes;