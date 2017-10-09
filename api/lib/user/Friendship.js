'use strict';
const assert = require('assert');
const UserEntity = require('./UserEntity');

class Friendship {

    constructor(firstUser, secondUser) {

        assert(firstUser instanceof UserEntity, 'bad instance for firstUser');
        assert(secondUser instanceof UserEntity, 'bad instance for secondUser');
        /** @var UserEntity */
        this.user = firstUser;
        /** @var UserEntity */
        this.friend = secondUser;
    }

    createFriendship() {
        if (this.friendshipExists()) {
            throw new Error('You are already friends with ' + this.friend.username);
        }

        this.user.friends.push(this.friend.username);
        this.user.save();

        this.friend.friends.push(this.user.username);
        this.friend.save();
    }

    deleteFriendship() {
        if (!this.friendshipExists()) {
            throw new Error('User ' + this.user.username + ' does not have friend ' + this.friend.username);
        }
        this.user.friends = this.user.friends.filter((username) => username !== this.friend.username);
        this.user.save();

        this.friend.friends = this.friend.friends.filter((username) => username !== this.user.username);
        this.friend.save();
    }

    friendshipExists() {
        return this.user.friends.indexOf(this.friend.username) !== -1;
    }
}

module.exports = Friendship;