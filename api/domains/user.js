'use strict';
/** @class Model */
const userDB = require('../models/user');
const assert = require('assert');

class UserDomain {

    constructor(userDbInstance) {
        /** @var userDB */
        this.userDbInstance = userDbInstance;
    }

    get id() {
        return this.userDbInstance.id;
    }

    get username() {
        return this.userDbInstance.username;
    }

    get password() {
        return this.userDbInstance.password;
    }

    get info() {
        return this.userDbInstance.info;
    }

    get createDate() {
        return this.userDbInstance.create_date;
    }

    get friends() {
        return this.userDbInstance.friends;
    }

    set info(infoObject) {
        assert(infoObject instanceof Object);
        for (let index in infoObject) {
            this.userDbInstance.info[index] = infoObject[index];
        }
    }
    set friends(friendsArray) {
        assert(friendsArray instanceof Array);
        this.userDbInstance.friends = friendsArray;
    }

    /**
     * @param username
     *
     * @returns Promise
     */
    static getByUsername(username) {
        return userDB.findOne({'username': username}).then((userInstance) => {
            if (userInstance) {
                return new UserDomain(userInstance);
            }

            throw new Error('Failed to get user by username=' + username)
        })
    }

    /**
     * @param username
     *
     * @returns Promise
     */
    static usernameExists(username) {
        return userDB.findOne({'username': username}).then((userInstance) => {
            return !!userInstance;
        })
    }

    /**
     * @param id
     *
     * @returns Promise
     */
    static getById(id) {
        return userDB.findById(id).then((user) => {
            return new UserDomain(user);
        })
    }

    /**
     * @param userObject
     *
     * @returns Promise
     */
    static create(userObject) {

        return UserDomain.usernameExists(userObject.username).then((usernameTaken) => {
            console.log(usernameTaken);
            if (usernameTaken) {
                throw new Error('Username already exists');
            }

            return userDB.create(userObject);

        }).then((user) => {
            return new UserDomain(user);
        });
    }

    /**
     * @param limit
     * @param skip
     * @param searchText
     *
     * @returns Promise
     */
    static getUsers(limit, skip, searchText) {
        let query;

        if (searchText) {
            query = userDB.find({$text: {$search: searchText}}, {score: {$meta: "textScore"}}).sort({score: {$meta: 'textScore'}})
        } else {
            query = userDB.find();
        }

        return query.limit(limit).skip(skip).then((results) => {
            return results.map((item) => new UserDomain(item));
        });
    }

    /**
     * @param username
     * @param password
     *
     * @returns UserDomain
     */
    static getUserIfPasswordMatches(username, password) {
        return UserDomain.getByUsername(username).then((user) => {
                if (!user) {
                    throw Error('Username does not exist');
                }

                if (user.password !== password) {
                    throw Error('Invalid password');
                }

                return new UserDomain(user);
            }
        );
    }

    save() {
        this.userDbInstance.save();
    }

    remove() {
        this.userDbInstance.remove();
    }
}

module.exports = UserDomain;