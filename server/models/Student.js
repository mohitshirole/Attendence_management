const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    rollNumber: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
    },
    blood_group: {
        type:String,
    },
    contact_number: {
        type:Number
    }
});

const Student = mongoose.model("Student", StudentSchema)
module.exports = Student;