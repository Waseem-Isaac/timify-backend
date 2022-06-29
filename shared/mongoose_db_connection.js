let mongoose = require('mongoose');

mongoose.connection.on('open', () => { console.log('Database connection successful') })
mongoose.connection.on('error', (err) => { 
    console.log('Database connection error : ', err); 
    process.exit(-1)
})

module.exports = mongoose;