var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId; 
var query = require('querymen').middleware;
var Task = require('../models/task');
const jwt = require('jsonwebtoken');
const { now } = require('mongoose');

// const Pusher = require("pusher");

// let pusher = new Pusher({
//   appId: process.env.PUSHER_APP_ID,
//   key: process.env.PUSHER_APP_KEY,
//   secret: process.env.PUSHER_APP_SECRET,
//   cluster: process.env.PUSHER_APP_CLUSTER
// });

  // =============================== 
  // Get tasks for a user.
  router.get('/', query(), function({ querymen: { query, select, cursor }, ...req}, res, next) {
    // Will return only the tasks per its user.
    const authHeader = String(req.headers['authorization'] || '');
    let decodedToken;
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7, authHeader.length);
      decodedToken = jwt.decode(token) ;
    }
    // // quickly remove all tasks for the current user.
    // Task.deleteMany({user: decodedToken._id }).then() 
    
    Task.find({
      user: decodedToken._id, 
      // $or: [
      //     {endTime: {"$exists": false}},
      //     {endTime: { "$lte": req.query?.['before'] ? new Date(req.query?.['before']) : new Date()}}
      //   ]
    }
    // , {}, {limit: 4}
    ).populate('project', 'name')
      .populate('user', 'username')
      .sort({  endTime: 'desc'})
      .exec(async function (err, tasks) {
        if (err) return res.status(500).json({ message: err.message })

        res.status(200).json(tasks.filter(p => p.user))
        // let overalLastTask = await Task.findOne({user: decodedToken._id, "endTime": { $ne: null } },{}).sort('endTime');
        // let lastTask = tasks[tasks.length-1];
        // res.status(200).json({
        //   data: tasks.filter(p => p.user),
        //   pagination: {
        //     overalLastDate: overalLastTask?.endTime
        //   }
        // })
      })
  });

  // Get all tasks fo a all users.
  router.get('/all', query(), function({ querymen: { query, select, cursor }, ...req}, res, next) {
    Task.find(query,select,cursor)
              .populate('project', 'name')
              .populate('user', 'username')
              .sort({ endTime: 'desc' })
    .exec(async function (err, tasks) {
      if (err) return res.status(500).json({message: err.message})

      let count = await Task.count();

      res.status(200).json({
        data: tasks.filter(p => p.user),
        pagination: {
          count,
          lastPage: Math.ceil(count / cursor?.limit)
        }
      })
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
  // Update multiple tasks by id
  router.put('/', async function(req, res) {
    req.body.tasks.forEach(async task => {
      await Task.findByIdAndUpdate(new ObjectId(task?._id), {
         description: task?.description
      }, {runValidators: true, new: true}).catch(err => {
        res.status(500).json({err});
      })
    });

    await res.status(200).json({message: 'Tasks updated successfully'});
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
