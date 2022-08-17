var express = require('express');
var router = express.Router();

var User = require('../models/user');
const bcrypt = require('bcrypt');

const config = require('../shared/config');


// Get all users
router.get('/' , (req , res) => {
    User.aggregate([
    {
        $lookup: {
            from: "tasks", // "collection to join"
            localField: "_id" , //field from the current documents
            foreignField: "user", //field from the documents of the "collection to join"
            as: "tasks"// output
        },
    },
    {
        $project: {
            _id: "$_id",
            email: "$email",
            password:  "$password",
            picture:  "$picture",
            username: "$username",
            tasksCount:{$size:"$tasks"},
            tasksTime: {$sum: "$tasks.periodAsANumber"}
        }
    }
   ], function(error, data) {
        if(error) {throw error}
        
        res.status(200).json(data); 
    })
    .sort({ tasksTime: 'desc'})
    .catch(err => { res.status(500).send({message: err.message})})
})

router.get('/:id', (req , res) => {
    User.findById(req.params.id).then(user => { 
        const {password, ...userData} = user.toObject();
        res.status(200).json(userData);
    }).catch(err => res.status(500).json({message: err.message}));
})

// Register user
router.post('/' , async(req , res) => {
    
    if(req.body.password) {
        if(req.body.password.length < 6) {
            return res.status(400).send({message : 'Password is shorter than the minimum allowed length (6)'})
        }
    }

   newUser = new User({ username : req.body.username , email: req.body.email , password: req.body.password});
   newUser['password'] = req.body.password ? await bcrypt.hash(req.body.password, 10) : '';
   newUser['picture'] = req.body.picture ? 
         req.body.picture : 
        `https://ui-avatars.com/api/?background=f0f0f0&color=29a0e9&name=${req.body.username}`
   User.create(newUser).then(user => {
       res.status(200).send({message : 'User added successfully'})
   }).catch(err => {
       res.status(500).send({message : err.message})
   })
})


module.exports = router;