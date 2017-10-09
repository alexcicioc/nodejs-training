// 'use strict';
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
    getUsersPerTown: getUsersPerTown,
    getAverageNumberOfFriends: getAverageNumberOfFriends,
    getNumberOfUsersByAge: getNumberOfUsersByAge,
    test: test
};

let User = require('../models/user');
let Report = require('../lib/user/Report');

function test(req, res) {
    res.status(200).send({ceva: 'ceva'});
}

function getNumberOfUsersByAge(req, res) {

    Report.getUsersByAge().then((results) => {
        response.success(res, results);
    });
}

function getAverageNumberOfFriends(req, res) {
    User.getNumberOfFriendsForEachUser().then((doc) => {
        response.success(res, {averageNumberOfFriends: doc[0].averageNumberOfFriends});
    });
}

function getUsersPerTown(req, res) {
    // let body = req.swagger.params.body.value;

    /**
     * V2
     */
    User.getDistinctTowns().then((towns) => {

        let promises = [];
        for (let town of towns) {
            promises.push(User.getNumberOfUsersPerTown(town));
        }

        let responseData = {towns: []};

        Promise.all(promises).then((results) => {
            results.forEach((value, index) => responseData.towns.push({townName: towns[index], numberOfUsers: value}));
            response.success(res, responseData);
        })
    }).catch((err) => {
        response.badRequestResponse(res, err.message)
    });

    /**
     * V3
     */
    // User.getDistinctTowns()
    //     .then((towns) => {
    //
    //         let townResults = [];
    //         for (let town of towns) {
    //             townResults.push(User.getNumberOfUsersPerTown(town));
    //         }
    //
    //         return townResults;
    //
    //     })
    //     .all()
    //     .then((results) => {
    //         console.log(results);
    //         let responseData = {towns: []};
    //         results.forEach((value, index) => responseData.towns.push({townName: 'Unknown', numberOfUsers: value}));
    //         response.success(res, responseData);
    //     })
    //     .catch((err) => {
    //         response.badRequestResponse(res, err.message)
    //     });
}

