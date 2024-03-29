var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors')

var login = require('./routes/login')
var users = require('./routes/users');
var tasks = require('./routes/tasks');
var projects = require('./routes/projects');
var reports = require('./routes/reports');

var isAuthenticated = require('./shared/isAuthenticated');
const { uploadMiddleWare, upload } = require('./shared/upload');

var app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use('/api/v1/login', login)
app.use('/api/v1/users',isAuthenticated, users);
app.use('/api/v1/tasks', isAuthenticated, tasks);
app.use('/api/v1/projects',isAuthenticated, projects);
app.use('/api/v1/reports',isAuthenticated, reports);


app.post('/api/v1/upload' , upload.single('image'), uploadMiddleWare)


app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})
module.exports = app;
