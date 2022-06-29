var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId; 
var query = require('querymen').middleware;
var Post = require('../models/post');

const Pusher = require("pusher");

let pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER
});

  // =============================== 
  // Get all posts
    router.get('/', query(), function({ querymen: { query, select, cursor } }, res, next) {
      Post.find(query,select, cursor)
                .populate('user' , 'name picture')
                .populate('category', 'name')
                .populate('comments.user' , 'name picture')
                .sort({ createdAt: -1 })
      .exec(function (err, posts) {
        if (err) return res.status(500).json({message: err.message})

        posts.forEach(p => { p.comments = p.comments.filter(c => c.user); }); // Only return comment made by exit user.  
        res.status(200).json(posts.filter(p => p.user))
      })
    });

  // =============================== 
  // Get post by id 
  router.get('/:id' , (req , res ) => {
    Post.findById(req.params.id)
          .populate('user', 'name picture' )
          .populate('category', 'name')
          .populate('comments.user' , 'name picture')
      .exec(function (err, post) {
      if (err) return res.status(500).json({message: err.message})
      if(!post) return res.status(404).json({message: 'Post with id :( ' +req.params.id+ ' )is not fount' })

      post['comments'] = post.comments.filter(comment => comment.user);;
      res.status(200).json(post)
    })
  });

  // =============================== 
  // Add Post
  router.post('/', function(req,res) {
   var newPost = new Post({content: req.body.content , comments: [] ,likes: [], user: req.body.user_id, category: req.body.category_id });
   Post.create(newPost).then((result) => {
    pusher.trigger('posts-channel', 'postAdded', { post: result }, {socket_id: req.body.socketId});
    res.status(200).json({message: 'Post added successfully' , post: result});
   }).catch(err => {
     res.status(500).json({message: err.message});
   })
  })

  // =============================== 
  // Update post by id
  router.put('/:id', function(req, res) {
    Post.findByIdAndUpdate(req.params.id, {content: req.body.content, category: req.body.category_id }, {runValidators: true})
    .then(result => {
      if(!result) return res.status(404).json({message: 'Post with id :( ' +req.params.id+ ' )is not found' })
      res.status(200).json({message: 'Post updated successfully', post: result});
    }).catch(err => {
      res.status(500).json({message: err.message});
    })
  })

  // =============================== 
  // Delete post by id
  router.delete('/:id', function(req, res) {
    Post.findByIdAndDelete(req.params.id).then(result => {
      if(!result) return res.status(404).json({message: 'Post with id :( ' +req.params.id+ ' )is not found' })

      pusher.trigger('posts-channel', 'postDeleted', { postId: req.params.id }, {socket_id: req.query.socketId});
      res.status(200).json({message: 'Post deleted successfully', post: result});
    }).catch(err => {
      res.status(500).catch({message: err.message});
    })
  })


// Likes
router.put('/:id/like' , function(req, res) {
  
  Post.findById(req.params.id).then(post => {
    post.likes.includes(req.body.userId) ?  post.likes.pull(req.body.userId) :  post.likes.push(req.body.userId)     
    post.save(function (err) {
      if(err) {
          console.error('ERROR!');
          res.status(500).json({message : err.message});
      }
    });

    pusher.trigger('posts-channel', 'likeAdded', { postId: req.params.id, numberOfLikes: post.likes.length }, {socket_id: req.body.socketId});
    res.status(200).json({numberOfLikes: post.likes.length});
  })
})

// Get Post by User Id
router.get('/user/:user_id', (req, res) => {
  Post.find({user: req.params.user_id})
      .populate('user' , 'name picture')
      .populate('category', 'name')
      .populate('comments.user' , 'name picture')
      .sort({ createdAt: -1 })
    .exec(function (err, posts) {
    if (err) return res.status(500).json({message: err.message})

    posts.forEach(p => { p.comments = p.comments.filter(c => c.user); }); // Only return comment made by exit user.        
    res.status(200).json(posts.filter(p => p.user))
  })
})

module.exports = router;
