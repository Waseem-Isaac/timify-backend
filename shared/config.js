require('dotenv').config();

let config = {};
config.baseUrl = 'https://blogify-backend.herokuapp.com/';
// config.baseUrl = 'http://localhost:3000/';
config.dbConnectionString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0-rfqh1.azure.mongodb.net/timify?retryWrites=true&w=majority`;

config.jwtPrivateKey = process.env.JWT_PRIVATE_KEY;

module.exports = config;