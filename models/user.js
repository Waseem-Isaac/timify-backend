var mongoose = require('mongoose');
var crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../shared/config');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        match: /^\S+@\S+\.\S+$/ ,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    picture : {
        type : String,
        trim: true
    }
}, {versionKey: false})

userSchema.methods = {
    generateAuthToken() {
        const jwtPrivateKey = config.jwtPrivateKey;
        // const token = jwt.sign({_id: this._id},{expiresIn: '1d'}).;
        // return token;
        return new Promise((resolve , reject) => {
            jwt.sign({_id: this._id}, jwtPrivateKey,(err , token) => {
                if(err) reject(err)
                resolve(token);
            })
        })
    },

    authenticate(password, next){
        return bcrypt.compare(password, this.password)
    }
}


module.exports = mongoose.model('User' , userSchema) , userSchema;