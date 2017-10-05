const config = require('../../config');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const response = require('./response'); // used to create, sign, and verify tokens
User = require('../models/user');


module.exports.adminAuth = (req, authOrSecDef, scopesOrApiKey, cb) => {
    checkToken(req, authOrSecDef, scopesOrApiKey, () => {
        if (req.user.userType === 1) {
            cb();
        } else {
            throw Error('user is not admin');
        }
    });

};

function checkToken(req, authOrSecDef, scopesOrApiKey, cb) {
    // check header or url parameters or post parameters for token
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, config.auth.secret, function (err, decoded) {
            if (err) {
                throw Error('Failed to validate the token');
                // return response.unauthorized(res, 'Failed to validate the token');
            } else {
                // if everything is good, save to request for use in other routes
                // req.decoded = decoded;

                User.findById(decoded.id).then((user) => {
                    if (!user) {
                        throw new Error('Auth check failed');
                    }

                    req.user = user;
                    cb();
                }).catch((err) => {
                    throw new Error(err.message);
                });
            }
        });

    } else {
        throw Error('No token provided');
    }
}

function generateToken(user) {
    return jwt.sign({
        username: user.username,
        password: user.password,
        id: user.id,
    }, config.auth.secret, {
        expiresIn: config.auth.authTtl // expires in 24 hours
    });
}

function encryptPassword(password) {
    let crypto = require('crypto');
    let hash = crypto.createHmac('sha512', config.auth.passwordSalt);
    /** Hashing algorithm sha512 */
    hash.update(password);
    return hash.digest('hex');
}

module.exports.checkToken = checkToken;
module.exports.generateToken = generateToken;
module.exports.encryptPassword = encryptPassword;
