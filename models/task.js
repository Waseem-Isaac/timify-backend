var mongoose = require('mongoose');
var mongooseKeywords = require('mongoose-keywords')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    startTime : { type: Date, required: true, default: Date.now },
    endTime : { type: Date, required: false },
    // hasEndTime : { 
    //     type: Boolean,
    //     // default: true,
    // },
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
    },

    periodAsANumber: {
        type: Number, required: false
    }
}, {versionKey : false , timestamps: true
    // , toJSON: { virtuals: true },
    // toObject: { virtuals: true }
});


taskSchema.pre('save', async function (next) {
    this.periodAsANumber = await (new Date(this.get('endTime')).getTime() - new Date(this.get('startTime')).getTime() || 0);
    next();
});

taskSchema.pre('findOneAndUpdate', async function (next) {
    this._update.periodAsANumber = await (new Date(this.get('endTime')).getTime() - new Date(this.get('startTime')).getTime() || 0);
    next();
});

// taskSchema.plugin(mongooseKeywords, {paths: ['content']});


module.exports = mongoose.model('Task' , taskSchema);