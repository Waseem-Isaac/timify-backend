var mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    }
}, {versionKey : false });

module.exports = mongoose.model('Project' , projectSchema);