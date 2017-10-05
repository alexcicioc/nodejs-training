const mongoose = require('mongoose');

// Book Schema
const imageSchema = mongoose.Schema({
    title: {
        min: 2,
        type: String,
        required: true
    },
    imagePath: {
        type: String,
        required: true
    },
    comments: {
        type: Object,
        default: {}
    },
    keywords: {
        type: Array,
        default: []
    },
    createdBy: {
        type: String,
        required: true
    },
    create_date: {
        type: Date,
        default: Date.now
    }
});

const Image = module.exports = mongoose.model('Image', imageSchema);

// Add User
module.exports.addImage = (image, callback) => {
    Image.create(image, callback);
};
