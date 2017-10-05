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
    addFriend: addFriend,
    deleteFriend: deleteFriend,
};
let User = require('../models/user');

function updateUser(req, res) {
    let infoObject = req.swagger.params.body.value;

    for (let key in infoObject) {
        if (req.user.info.hasOwnProperty(key)) {
            req.user.set('info.' + key, infoObject[key]);
        }
    }
    req.user.save();
    response.genericSuccess(res, 'User updated')
}

function getUsers(req, res) {
    let pageNo = req.swagger.params.pageNo.value;
    let itemsOnPage = req.swagger.params.itemsOnPage.value;
    let searchText = req.swagger.params.searchText.value;

    if (!searchText) {
        User.getUsers(itemsOnPage, pageNo).then((docs) => {
            response.success(res, {users: docs.map(mapUsers)});
        });
    } else {
        User.searchUsers(searchText, itemsOnPage, pageNo).then((docs) => {
            response.success(res, {users: docs.map(mapUsers)});
        });
    }

    // Applying higher order function tutorial
    // https://www.youtube.com/watch?v=bCqtb-Z5YGQ&list=PL0zVEGEvSaeEd9hlmCXrk5yUyqUag-n84&t=316
    let mapUsers = (user) => {
        return {userId: user.id, info: user.info}
    };
}

function addFriend(req, res, next) {
    let body = req.swagger.params.body.value;

    User.getByUsername(body.username).then((user) => {

        req.user.friends.push(user.username);
        req.user.save();

        user.friends.push(req.user.username);
        user.save();

        response.genericSuccess(res, 'Friend added');
    }).catch(() => {
        response.badRequestResponse(res, 'User does not exist', httpCodes.NOT_FOUND)
    });
}

function deleteFriend(req, res) {
    let body = req.swagger.params.body.value;
    if (req.user.friends.indexOf(body.username) === false) {
        response.badRequestResponse(res, 'Friend does not exist', httpCodes.NOT_FOUND)
    } else {

        User.getByUsername(body.username).then((user) => {
            // req.user.friends[req.user.friends.indexOf(body.username)] = undefined;
            // req.user.remove('friends.' + req.user.friends.indexOf(body.username), undefined);
            req.user.friends = req.user.friends.filter(function (friendUserName) {
                return friendUserName !== body.username
            });
            req.user.save();

            user.friends = user.friends.filter(function (friendUserName) {
                return friendUserName !== req.user.username
            });

            user.save();

            response.genericSuccess(res, 'Friend deleted');
        }).catch(() => {
            response.badRequestResponse(res, 'User does not exist', httpCodes.NOT_FOUND)
        });
    }
}

function deleteUser(req, res) {
    let body = req.swagger.params.body.value;

    User.findById(body.userId).exec(function (err, user) {
        if (err) {
            throw err;
        } else if (!user) {
            response.badRequestResponse(res, 'User with id ' + body.userId + ' not found')
        } else {
            user.remove();
            response.genericSuccess(res, 'Users deleted');
        }
    });
}

function authenticate(req, res) {

    let body = req.swagger.params.body.value;
    body.password = authentication.encryptPassword(body.password);

    User.getUserIfPasswordMatches(body.username, body.password).then((user) => {
        response.success(res, {
            userId: user.id,
            authToken: authentication.generateToken(user)
        });
    }).catch((err) => {
        response.unauthorized(res, err.message);
    });
}

function createUser(req, res) {

    let body = req.body;
    body.password = authentication.encryptPassword(body.password);

    User.getByUsername(body.username).then((user) => {
        if (!user) {
            User.create(req.body).then((user) => {
                response.success(res, {
                    id: user.id,
                    createDate: user.create_date
                }, httpCodes.CREATED);
            });
        } else {
            response.badRequestResponse(res, 'Username already exists', httpCodes.CONFLICT);
        }
    });
}