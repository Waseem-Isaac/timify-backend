
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var User = require('../models/user');
var password = require('../shared/passport');
const config = require('../shared/config');
const jwt = require('jsonwebtoken');

router.post('/', (req, res) => {
    User.findOne({email : req.body.email}).then(user => {
        if(!user) return res.status(401).json({message: 'Email not found - Login failed !'});

       user.authenticate(req.body.password).then(valid => {
           if(valid) {
            user.generateAuthToken().then(token => {
                const {password, ...userData} = user.toObject();
                res.status(200).json({message: 'logged in successfully', token, userData});
            }).catch(err => res.status(500).json({message: 'Please provide a valid secert key - Login failed !'}));
            // const token = user.generateAuthToken();
            // const {password, ...userData} = user.toObject();
            // res.status(200).json({message: 'logged in successfully', token, userData});
           }else {
            return res.status(401).json({message: 'Password not match - Login failed !'});
           }
       })
    })
});



module.exports = router;