var path = require('path');
var multer = require('multer');
const config = require('./config');


// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({ storage: storage, fileFilter: fileFilter })

const uploadMiddleWare = ( req , res , next ) => {
    if(!req.file) {
        return res.status(400).json({message: 'Fail to upload file'});
    }
    return res.status(200).json({message: 'File Upladed successfully', imagePath: config.baseUrl + req['file']['path'] , file: req.file})
};

module.exports= { upload , uploadMiddleWare }