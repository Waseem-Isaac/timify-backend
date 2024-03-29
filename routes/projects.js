var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId; 
var Project = require('../models/project');

  // =============================== 
  // Get projects
  router.get('/', function(req, res, next) {
    Project.find().then(projects => {
        res.status(200).json(projects);
    }).catch(err => {
        res.status(500).json({message: err.message});
    })
  });

  // =============================== 
  // Get all projects
  router.get('/all', function(req, res, next) {
    Project.aggregate([
    {
        $lookup: {
            from: "tasks", // "collection to join"
            localField: "_id" , //field from the current documents
            foreignField: "project", //field from the documents of the "collection to join"
            as: "tasks"// output
        },
    },
    {
        $project: {
            _id: "$_id",
            name: "$name",
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




  });




   // =============================== 
  // Add Project
  router.post('/', function(req,res) {
    console.log(req?.body)
    var newProject = new Project({name: req.body.name});
    Project.create(newProject).then((result) => {
    //  pusher.trigger('posts-channel', 'postAdded', { post: result }, {socket_id: req.body.socketId});
     res.status(200).json({message: 'Project added successfully' , project: result});
    }).catch(err => {
      res.status(500).json({message: err.message});
    })
   })

module.exports = router;
