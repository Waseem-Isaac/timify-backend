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
    });
    
  });


module.exports = router;
