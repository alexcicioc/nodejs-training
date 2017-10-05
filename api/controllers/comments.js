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
const guid = require('../helpers/guid');
const config = require('../../config');

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
    postComment: postComment,
    deleteComment: deleteComment,
    editComment: editComment
};

function editComment(req, res) {
    let body = req.swagger.params.body.value;
    Image.findById(body.imageId).exec((err, image) => {
        if (err) {
            response.badRequestResponse(res, err.message);
        } else {

            let commentId = body.commentId;
            image.set('comments.' + commentId + '.text', body.text);
            image.save();

            response.genericSuccess(res, 'Comment text updated');
        }
    });
}

function postComment(req, res) {
    let body = req.swagger.params.body.value;
    Image.findById(body.imageId).exec((err, image) => {

        if (err) {
            response.badRequestResponse(res, err.message);
        } else {
            let commentId = guid.generate();
            image.set('comments.' + commentId, {
                text: body.text,
                author: req.user.username,
                dateCreated: new Date()
            });


            image.save();

            response.success(res, {commentId: commentId});
        }
    });
}

function deleteComment(req, res) {
    let body = req.swagger.params.body.value;
    Image.findById(body.imageId).exec((err, image) => {
        if (err) {

            response.badRequestResponse(res, err.message);
        } else if (isAllowedToDeleteComment(image.createdBy, body.commentId, req.user.username)) {
            response.badRequestResponse(res, 'You do not own the image');
        } else {
            image.set('comments.' + body.commentId, undefined);
            image.save();
        }

        response.genericSuccess(res, 'Comment deleted');
    });
}

// TODO move to helper
function isAllowedToDeleteComment(image, commentId, user) {
    // The uploader of the image can manage it's comments
    if (image.createdBy !== user.username) {
        return true;
    }

    // the author of the comment can delete it's own comment
    if (image.comments[commentId].author.username === user.username) {
        return true;
    }

    // lastly any admin should delete any comment
    return user.userType === 1;
}