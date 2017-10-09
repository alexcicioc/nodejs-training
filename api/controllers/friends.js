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
    addFriend: addFriend,
    deleteFriend: deleteFriend,
};

const UserRepository = require('../lib/user/UserRepository');
const Friendship = require('../lib/user/Friendship');

function addFriend(req, res) {
    let body = req.swagger.params.body.value;

    UserRepository.getByUsername(body.username).then((friend) => {

        let friendship = new Friendship(req.user, friend);

        if (friendship.friendshipExists()) {
            response.badRequestResponse(res, 'You are already friends with ' + friend.username, httpCodes.CONFLICT)
        } else {
            friendship.createFriendship();
            response.genericSuccess(res, 'Friend added');
        }

    }).catch((err) => {
        response.badRequestResponse(res, err.message, httpCodes.NOT_FOUND)
    });
}

function deleteFriend(req, res) {

    let body = req.swagger.params.body.value;

    UserRepository.getByUsername(body.username).then((friend) => {

        let friendship = new Friendship(req.user, friend);
        friendship.deleteFriendship();
        response.genericSuccess(res, 'Friend deleted');

    }).catch(() => {
        response.badRequestResponse(res, 'User does not exist', httpCodes.NOT_FOUND)
    });
}
