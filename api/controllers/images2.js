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
const multer = require('multer');
const mime = require('mime');
const guid = require('../helpers/guid');
const config = require('../../config');
const fs = require('fs');
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
    uploadImage: uploadImage,
    setProfilePicture: setProfilePicture,
    getImagesByUser: getImagesByUser
};
let User = require('../models/user');

function getImagesByUser(req, res) {

    let userId = req.swagger.params.userId.value;

    User.findById(userId).then((user) => {

        if (!user) {
            throw new Error('User not found');
        }

        Image.find({createdBy: user.username}).limit(10).sort('-create_date').exec((err, results) => {
            if (err) {
                throw err;
            }

            response.success(res, {images: results});
        });
    }).catch((err) => {
        response.badRequestResponse(res, err.message, httpCodes.NOT_FOUND);
    });
}

function uploadImage(req, res) {

    let file = req.swagger.params.imageFile.value;

    if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif)$/)) {
        response.badRequestResponse(res, 'Bad file type, only images allowed', httpCodes.UNSUPPORTED_MEDIA_TYPE);
        return;
    }

    let path = './uploads/' + guid.generate() + '.' + mime.getExtension(file.mimetype);

    fs.writeFile(path, file.buffer, function (err) {
        if (err) {
            throw err;
        }

        Image.addImage({
            title: req.body.title,
            imagePath: path,
            keywords: req.body.keywords.split(','),
            createdBy: req.user.username,
        }, function (err, image) {
            if (err) {
                throw err;
            }
            response.success(
                res,
                {
                    url: config.app.baseUrl + path,
                    image: image
                }
            );
        });
    });
}

function setProfilePicture(req, res) {

    Image.findById(req.swagger.params.body.value.imageId).exec(function (err, image) {
        if (err) {
            throw err;
        }

        req.user.info.picture = image.imagePath;
        req.user.save();

        response.genericSuccess(res, 'Profile picture set');
    });
}
