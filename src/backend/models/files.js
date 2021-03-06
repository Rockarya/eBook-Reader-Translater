// FileSchema stores details about the files uploaded
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const FileSchema = new Schema({
    // title as entered while uploading the book
    title: {
        type: String,
    },
    // this represents the name with which we should query for the thumbnail
    file_path: {
        type: String,
        required: true
    },
    file_mimetype: {
        type: String,
        required: true
    },
    // name of the hashed file name generated by the time of uploading the book
    // to prevent the case when files uploaded have all the other details same
    file_name: {
        type: String,
    },
    author_name: {
        type: String,
    },
    language: {
        type: String,
    }},
    {
    timestamps: true
    }
);

module.exports = File = mongoose.model("File", FileSchema);