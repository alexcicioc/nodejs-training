const httpCodes = require('./httpCodes');

module.exports.genericSuccess = function (res, successMessage, data) {
    let responseBody = {
        success: true,
        description: successMessage
    };

    if (data) {
        responseBody.data = data;
    }

    res.send(responseBody);
};

module.exports.success = function (res, data, httpCode = httpCodes.OK) {
    let responseBody = {
        success: true,
    };

    if (data) {
        responseBody = data;
    }

    res.status(httpCode).send(responseBody);
};

module.exports.badRequestResponse = function (res, errorMessage, httpCode = httpCodes.BAD_REQUEST) {
    res.status(httpCode).send({
        success: false,
        description: errorMessage,
    });
};

module.exports.unauthorized = function (res, errorMessage) {
    res.status(httpCodes.UNAUTHORIZED).send({
        success: false,
        description: errorMessage,
    });
};

module.exports.exceptionResponse = function (res, exception) {
    console.error(exception);
    let response = {
        description: exception.message,
        success: false,
    };
    if (exception.failedValidation) {
        response.failedValidations = exception.results;
        res.status(httpCodes.BAD_REQUEST);
    } else {
        res.status(httpCodes.INTERNAL_SERVER_ERROR);
    }

    res.send(response);
};