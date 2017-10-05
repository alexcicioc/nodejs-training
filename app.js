'use strict';

const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cons = require('consolidate');
const config = require('./config');
const cors = require('cors');
const response = require('./api/helpers/response');

module.exports = app; // for testing
// view engine setup
app.engine('html', cons.swig);
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(config.db.mongoConnection);

SwaggerExpress.create(config.swagger, function (err, swaggerExpress) {
    if (err) {
        throw err;
    }

    // install middleware
    swaggerExpress.register(app);

    // Error handling for uncaught exceptions
    // Apparently if I don't provide all the params this function won't get called :|
    app.use(function (err, req, res, next) {
        response.exceptionResponse(res, err);
    });

    const port = process.env.PORT || 10010;
    app.listen(port);

    if (swaggerExpress.runner.swagger.paths['/hello']) {
        console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
    }
});
