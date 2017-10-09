'use strict';
const UserEntity = require('./UserEntity');
/** @class Model */
const userDB = require('../../models/user');

class UserRepository {
    /**
     * @param username
     *
     * @returns Promise
     */
    static getByUsername(username) {
        return userDB.findOne({'username': username}).then((userInstance) => {
            if (userInstance) {
                return new UserEntity(userInstance);
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
            return new UserEntity(user);
        })
    }

    /**
     * @param userObject
     *
     * @returns Promise
     */
    static create(userObject) {

        return this.usernameExists(userObject.username).then((usernameTaken) => {
            if (usernameTaken) {
                throw new Error('Username already exists');
            }

            return userDB.create(userObject);

        }).then((user) => {
            return new UserEntity(user);
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
            return results.map((item) => new UserEntity(item));
        });
    }

    /**
     * @param username
     * @param password
     *
     * @returns Promise
     */
    static getUserIfPasswordMatches(username, password) {

        return this.getByUsername(username).then((user) => {
                if (!user) {
                    throw Error('Username does not exist');
                }

                if (user.password !== password) {
                    throw Error('Invalid password');
                }

                return user;
            }
        );
    }
}

module.exports = UserRepository;