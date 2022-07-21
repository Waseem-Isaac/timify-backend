var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId; 
var query = require('querymen').middleware;
var Task = require('../models/task');
const jwt = require('jsonwebtoken');

// const Pusher = require("pusher");

// let pusher = new Pusher({
//   appId: process.env.PUSHER_APP_ID,
//   key: process.env.PUSHER_APP_KEY,
//   secret: process.env.PUSHER_APP_SECRET,
//   cluster: process.env.PUSHER_APP_CLUSTER
// });

  // =============================== 
  // Get all tasks
  router.get('/', query(), function({ querymen: { query, select, cursor }, ...req}, res, next) {
    // Will return only the tasks per its user.
    const authHeader = String(req.headers['authorization'] || '');
    let decodedToken;
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7, authHeader.length);
      decodedToken = jwt.decode(token) ;
    }

    Task.find({user: decodedToken._id , ...query,...select, ...cursor})
              .populate('project', 'name')
              .sort({ createdAt: 'desc' })
    .exec(function (err, tasks) {
      if (err) return res.status(500).json({message: err.message})
      res.status(200).json(tasks.filter(p => p.user))
    })
  });

  // =============================== 
  // Get task by id 
  router.get('/:id' , (req , res ) => {
    Task.findById(req.params.id)
          .populate('project', 'name')
      .exec(function (err, task) {
      if (err) return res.status(500).json({message: err.message})
      if(!task) return res.status(404).json({message: 'Task with id :( ' +req.params.id+ ' )is not fount' })

      res.status(200).json(task)
    })
  });

  // =============================== 
  // Add task
  router.post('/', function(req,res) {
   var newTask = new Task({...req.body});
 
   Task.create(newTask).then((result) => {
    // pusher.trigger('Tasks-channel', 'TaskAdded', { Task: result }, {socket_id: req.body.socketId});
    res.status(200).json({message: 'Task added successfully' , task: result});
   }).catch(err => {
     res.status(500).json({message: err.message});
   })
  })

  // =============================== 
  // Update task by id
  router.put('/:id', async function(req, res) {
    await Task.findByIdAndUpdate(new ObjectId(req.params.id), {
     ...req.body
    }, {runValidators: true, new: true})
    .populate('project', 'name')
    .then(result => {
      if(!result) return res.status(404).json({message: 'Task with id :( ' +req.params.id+ ' )is not found' })
      res.status(200).json({message: 'Task updated successfully', task: result});
    }).catch(err => {
      res.status(500).json({message: err.message});
    })
  })

   // =============================== 
  // Delete multiple by id
  router.delete('/bulk', function(req, res) {
    Task.deleteMany({_id: { $in: req.body['ids']}}).then(result => {
      if(!result) return res.status(400).json({message: 'Failed to delete tasks!' })

      // pusher.trigger('Tasks-channel', 'TaskDeleted', { taskId: req.params.id }, {socket_id: req.query.socketId});
      res.status(200).json({message: 'Tasks deleted successfully', task: result});
    }).catch(err => {
      res.status(500).catch({message: err.message});
    })
  })

  // =============================== 
  // Delete Task by id
  router.delete('/:id', function(req, res) {
    Task.findByIdAndDelete(req.params.id).then(result => {
      if(!result) return res.status(404).json({message: 'Task with id :( ' +req.params.id+ ' )is not found' })

      // pusher.trigger('Tasks-channel', 'TaskDeleted', { taskId: req.params.id }, {socket_id: req.query.socketId});
      res.status(200).json({message: 'Task deleted successfully', task: result});
    }).catch(err => {
      res.status(500).catch({message: err.message});
    })
  })

module.exports = router;
