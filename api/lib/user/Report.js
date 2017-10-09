'use strict';
/** @class Model */
const userDB = require('../../models/user');

class Report {

    /**
     * Get the number of users by age
     *
     * @returns {Promise|Promise.<TResult>}
     */
    static getUsersByAge() {
        let mapResults = (result) => ({age:result.id, total: result.total});

        return userDB.aggregate([
            {$match: {"info.age": {$exists: true}}},
            {$project: {"info.age": {$subtract: ["$info.age", {$mod: ["$info.age", 1]}]}}},
            {$group: {_id: "$info.age", total: {$sum: 1}}},
            {$sort: {"Total": -1}}
        ]).then((results) => results.map(mapResults));
    }
}