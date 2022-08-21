var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId; 
var Task = require('../models/task');
var User = require('../models/user');
var Project = require('../models/project');

  // =============================== 
  // Get all projects
  router.get('/count', async function(req, res, next) {
    res.status(200).json({
      tasks: await Task.count(),
      projects: await Project.count(),
      team: await User.count(),
      totalTime: await Task.aggregate([
        { $unwind: "$periodAsANumber" },
        { $group: { 
          _id: null,
           value: {
            $sum:"$periodAsANumber"
          }
        }}
      
      ])
    });

  });

  // Get the longest 5 tasks.
  router.get('/top-tasks', function(res,res) {
    Task.find()
    .populate('project', 'name')
    .populate('user', 'username')
    .sort({ periodAsANumber: 'desc'})
    .limit(4)
    .exec(function (err, tasks) {
      if (err) return res.status(500).json({ message: err.message })
      
      res.status(200).json(tasks.filter(p => p.user))
    })    
  })

   // Get the longest 5 tasks.
   router.get('/top-users', function(res,res) {
    res.redirect('/api/v1/users'); 
  })

   // Get the longest 5 tasks.
   router.get('/top-projects', function(res,res) {
    res.redirect('/api/v1/projects/all'); 
  })

module.exports = router;
