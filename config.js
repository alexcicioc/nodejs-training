const appConfig = {
    appRoot: __dirname,
    viewRoot: __dirname + '/views/',
    baseUrl: 'http://localhost:10010/',
};

const authentication = require('./api/helpers/authentication');

const authConfig = {
    secret: 'bdiuysf&^Tdgvyzdyube',
    authTtl: 1440000,
    passwordSalt: '(*hdbs677r5bds&*^%-',
};

const swaggerConfig = {
    appRoot: __dirname,
    swaggerSecurityHandlers: {
        UserAuthentication: authentication.checkToken,
        AdminAuthentication: authentication.adminAuth
    }
};

const dbConfig = {
    mongoConnection: 'mongodb://localhost/training',
};

module.exports.app = appConfig;
module.exports.swagger = swaggerConfig;
module.exports.auth = authConfig;
module.exports.db = dbConfig;