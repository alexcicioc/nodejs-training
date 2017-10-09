'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
 */

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

 It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
const response = require('../helpers/response');
const authentication = require('../helpers/authentication');
const httpCodes = require('../helpers/httpCodes');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
 - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
 - Or the operationId associated with the operation in your Swagger document

 In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
 we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
    createUser: createUser,
    getUsers: getUsers,
    deleteUser: deleteUser,
    updateUser: updateUser,
    authenticate: authenticate,
};
const UserRepository = require('../lib/user/UserRepository');

function createUser(req, res) {

    let body = req.body;
    body.password = authentication.encryptPassword(body.password);

    UserRepository.create(body).then((UserEntity) => {
        response.success(res, {
            id: UserEntity.id,
            createDate: UserEntity.createDate
        }, httpCodes.CREATED);
    }).catch((err) => {
        response.badRequestResponse(res, err.message, httpCodes.CONFLICT);
    });
}

function getUsers(req, res) {
    let pageNo = req.swagger.params.pageNo.value;
    let itemsOnPage = req.swagger.params.itemsOnPage.value;
    let searchText = req.swagger.params.searchText.value;

    let skip = (pageNo - 1) * itemsOnPage;

    UserRepository.getUsers(itemsOnPage, skip, searchText).then((users) => {
        response.success(res, {users: users.map(mapUsers)});
    });

    // Applying higher order function tutorial
    // https://www.youtube.com/watch?v=bCqtb-Z5YGQ&list=PL0zVEGEvSaeEd9hlmCXrk5yUyqUag-n84&t=316
    let mapUsers = (user) => {
        return {userId: user.id, info: user.info}
    };
}

function updateUser(req, res) {
    req.user.info = req.swagger.params.body.value;
    req.user.save();
    response.genericSuccess(res, 'User updated')
}

function deleteUser(req, res) {
    let body = req.swagger.params.body.value;

    UserRepository.getById(body.userId).then((user) => {
        if (!user) {
            throw new Error('User with id ' + body.userId + ' not found');
        } else {
            user.delete();
            response.genericSuccess(res, 'Users deleted');
        }
    }).catch((err) => {
        response.badRequestResponse(res, err.message);
    });
}


function authenticate(req, res) {

    let body = req.swagger.params.body.value;
    body.password = authentication.encryptPassword(body.password);

    UserRepository.getUserIfPasswordMatches(body.username, body.password).then((user) => {
        response.success(res, {
            userId: user.id,
            authToken: authentication.generateToken(user)
        });
    }).catch((err) => {
        console.log(err);
        response.unauthorized(res, err.message);
    });
}
