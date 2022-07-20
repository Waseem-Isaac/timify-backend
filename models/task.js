var mongoose = require('mongoose');
var mongooseKeywords = require('mongoose-keywords')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    startTime : { type: Date, required: true, default: Date.now },
    endTime : { type: Date, required: false },
    period  : { type: String, required: false},
    user: { 
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'User',
        required: true
    },
    project: {
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'Project',
        required: false
    }
}, {versionKey : false , timestamps: true});

// taskSchema.plugin(mongooseKeywords, {paths: ['content']});


module.exports = mongoose.model('Task' , taskSchema);