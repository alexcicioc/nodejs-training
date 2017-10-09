'use strict';
const assert = require('assert');

class UserEntity {

    constructor(userDbInstance) {
        assert(userDbInstance instanceof require('../../models/user'), 'userDbInstance is not a mongoose model');
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

    save() {
        this.userDbInstance.save();
    }

    remove() {
        this.userDbInstance.remove();
    }
}

module.exports = UserEntity;