const mongoose = require('mongoose');

// Book Schema
const userSchema = mongoose.Schema({
    info: {
        name: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            required: true,
            min: 18,
            max: 65
        },
        town: {
            type: String,
            required: true
        },
        picture: {
            type: String
        },
        gender: {
            type: String
        }
    },
    friends: {
        type: Array,
        default: []
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        min: 5,
        max: 20
    },
    userType: {
        type: Number,
        default: 0
    },
    create_date: {
        type: Date,
        default: Date.now
    }
});

const User = module.exports = mongoose.model('User', userSchema);

// Get Users
module.exports.getUsers = (pageItems = 20, page = 1) => {
    let skip = (page - 1) * pageItems;
    return User.find().limit(pageItems).skip(skip);
};

// Search User
module.exports.searchUsers = (searchFor, pageItems = 20, page = 1) => {
    let skip = (page - 1) * pageItems;

    return User.find(
        {$text: {$search: searchFor}},
        {score: {$meta: "textScore"}}
    )
        .sort({score: {$meta: 'textScore'}})
        .limit(pageItems)
        .skip(skip)
};

// Get Users
module.exports.getById = (id) => {
    return User.findById(id);
    // assert.ok(promise instanceof require('mpromise'));
    // return promise;
};


module.exports.getByUsername = (username) => {
    return User.findOne({'username': username});
};

module.exports.getDistinctTowns = () => {
    return User.find().distinct('info.town');
};

module.exports.getNumberOfUsersPerTown = (town) => {
    return User.count({'info.town': town}).select('info.town');
};

module.exports.getNumberOfFriendsForEachUser = () => {
    // User.aggregate([{$match: {id: {$regex: /.*/}}}, {$project: {friends: {$size: '$friends'}}}]).then((doc) => {
    //     console.log(doc);
    // });
    // return User.find().select('friends');

    // return User.aggregate([
    //     {
    //         $project: {
    //             numberOfFriends: {$size: "$friends"}
    //         }
    //     }
    // ]);

    return User.aggregate([
        {
            $group: {
                _id: "results", // Id is mandatory event though I don't need it
                averageNumberOfFriends: {$avg: {$size: "$friends"}}
            }
        }
    ]);
};

module.exports.getUserIfPasswordMatches = (username, password) => {
    return User.getByUsername(username).then((user) => {
            if (!user) {
                throw Error('Username does not exist');
            }

            if (user.password !== password) {
                throw Error('Invalid password');
            }

            return user;
        }
    )
};