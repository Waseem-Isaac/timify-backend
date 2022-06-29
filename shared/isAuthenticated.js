const jwt = require('jsonwebtoken');
const config = require('../shared/config');

const isAuthenticated = (req, res, next) => {
    if (typeof req.headers.authorization !== "undefined") {
        // retrieve the authorization header and parse out the
        // JWT using the split function
        let token = req.headers.authorization.split("Bearer ")[1];
        let privateKey = config.jwtPrivateKey;
        // Here we validate that the JSON Web Token is valid and has been 
        // created using the same private pass phrase
        jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, user) => {            
            if (err) {  
                return res.status(401).json({ message: "Not Authorized - Invalid token" });
            }
            // if the JWT is valid, allow them to hit
            // the intended endpoint
            return next();
        });
    } else {
        // No authorization header exists on the incoming
        // request, return not authorized and throw a new error 
        return res.status(401).json({ message: "Not Authorized - No token provided" });
    }
}

module.exports = isAuthenticated;