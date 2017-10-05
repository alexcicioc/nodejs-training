'use strict';
const chai = require('chai');
const ZSchema = require('z-schema');
const customFormats = module.exports = function (zSchema) {
    // Placeholder file for all custom-formats in known to swagger.json
    // as found on
    // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat

    let decimalPattern = /^\d{0,8}.?\d{0,4}[0]+$/;

    /** Validates floating point as decimal / money (i.e: 12345678.123400..) */
    zSchema.registerFormat('double', function (val) {
        return !decimalPattern.test(val.toString());
    });

    /** Validates value is a 32bit integer */
    zSchema.registerFormat('int32', function (val) {
        // the 32bit shift (>>) truncates any bits beyond max of 32
        return Number.isInteger(val) && ((val >> 0) === val);
    });

    zSchema.registerFormat('int64', function (val) {
        return Number.isInteger(val);
    });

    zSchema.registerFormat('float', function (val) {
        // better parsing for custom "float" format
        if (Number.parseFloat(val)) {
            return Number.parseFloat(val);
        } else {
            return false;
        }
    });

    zSchema.registerFormat('date', function (val) {
        // should parse a a date
        return !isNaN(Date.parse(val));
    });

    zSchema.registerFormat('dateTime', function (val) {
        return !isNaN(Date.parse(val));
    });

    zSchema.registerFormat('password', function (val) {
        // should parse as a string
        return typeof val === 'string';
    });
};

customFormats(ZSchema);

const validator = new ZSchema({});
const request = require('request');
const expect = chai.expect;

require('dotenv').load();

describe('/users/search/{text}', function () {
    describe('get', function () {
        it('should respond with 200 Success', function (done) {
            /*eslint-disable*/
            let schema = {
                "required": [
                    "users"
                ],
                "properties": {
                    "users": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "userId": {
                                    "type": "string",
                                    "description": "user's identifier"
                                },
                                "info": {
                                    "type": "object",
                                    "properties": {
                                        "age": {
                                            "type": "number",
                                            "description": "user age"
                                        },
                                        "gender": {
                                            "type": "string",
                                            "description": "user age"
                                        },
                                        "town": {
                                            "type": "string",
                                            "description": "user age"
                                        },
                                        "name": {
                                            "type": "string",
                                            "description": "user age"
                                        }
                                    }
                                }
                            },
                            "required": [
                                "userId",
                                "info"
                            ]
                        }
                    }
                }
            };

            /*eslint-enable*/
            request({
                    url: 'http://localhost:10010/users/search/alex',
                    json: true,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Access-Token': process.env.USER_AUTHENTICATION
                    }
                },
                function (error, res, body) {
                    if (error) return done(error);

                    expect(res.statusCode).to.equal(200);

                    expect(validator.validate(body, schema)).to.be.true;
                    done();
                }
            )
            ;
        });

        it('should respond with default Error', function (done) {
            /*eslint-disable*/
            let schema = {
                "required": [
                    "description",
                    "success",
                    "errorCode"
                ],
                "properties": {
                    "description": {
                        "type": "string"
                    },
                    "success": {
                        "type": "boolean"
                    },
                    "errorCode": {
                        "type": "number"
                    }
                }
            };

            /*eslint-enable*/
            request({
                    url: 'http://localhost:10010/users/search/{text PARAM GOES HERE}',
                    json: true,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Access-Token': process.env.USER_AUTHENTICATION
                    }
                },
                function (error, res, body) {
                    if (error) return done(error);

                    expect(res.statusCode).to.equal('DEFAULT RESPONSE CODE HERE');

                    expect(validator.validate(body, schema)).to.be.true;
                    done();
                }
            )
            ;
        });

    });

});
