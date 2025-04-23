const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 2,
        maxlength: 20
    }
});

module.exports = mongoose.model("Area", areaSchema);