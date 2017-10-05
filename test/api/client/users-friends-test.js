'use strict';
var chai = require('chai');
var ZSchema = require('z-schema');
var customFormats = module.exports = function(zSchema) {
  // Placeholder file for all custom-formats in known to swagger.json
  // as found on
  // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat

  var decimalPattern = /^\d{0,8}.?\d{0,4}[0]+$/;

  /** Validates floating point as decimal / money (i.e: 12345678.123400..) */
  zSchema.registerFormat('double', function(val) {
    return !decimalPattern.test(val.toString());
  });

  /** Validates value is a 32bit integer */
  zSchema.registerFormat('int32', function(val) {
    // the 32bit shift (>>) truncates any bits beyond max of 32
    return Number.isInteger(val) && ((val >> 0) === val);
  });

  zSchema.registerFormat('int64', function(val) {
    return Number.isInteger(val);
  });

  zSchema.registerFormat('float', function(val) {
    // better parsing for custom "float" format
    if (Number.parseFloat(val)) {
      return true;
    } else {
      return false;
    }
  });

  zSchema.registerFormat('date', function(val) {
    // should parse a a date
    return !isNaN(Date.parse(val));
  });

  zSchema.registerFormat('dateTime', function(val) {
    return !isNaN(Date.parse(val));
  });

  zSchema.registerFormat('password', function(val) {
    // should parse as a string
    return typeof val === 'string';
  });
};

customFormats(ZSchema);

var validator = new ZSchema({});
var request = require('request');
var expect = chai.expect;

require('dotenv').load();

describe('/users/friends', function() {
  describe('delete', function() {
    it('should respond with 200 Success', function(done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "returns true if successful"
          },
          "description": {
            "type": "string",
            "description": "a short comment"
          },
          "data": {
            "type": "object",
            "description": "Additional data returned"
          }
        },
        "required": [
          "success",
          "description"
        ]
      };

      /*eslint-enable*/
      request({
        url: 'http://localhost:10010/users/friends',
        json: true,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          X-Access-Token: process.env.USER_AUTHENTICATION
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(200);

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with default Error', function(done) {
      /*eslint-disable*/
      var schema = {
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
        url: 'http://localhost:10010/users/friends',
        json: true,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          X-Access-Token: process.env.USER_AUTHENTICATION
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal('DEFAULT RESPONSE CODE HERE');

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

  });

  describe('post', function() {
    it('should respond with 200 Success', function(done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "returns true if successful"
          },
          "description": {
            "type": "string",
            "description": "a short comment"
          },
          "data": {
            "type": "object",
            "description": "Additional data returned"
          }
        },
        "required": [
          "success",
          "description"
        ]
      };

      /*eslint-enable*/
      request({
        url: 'http://localhost:10010/users/friends',
        json: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          X-Access-Token: process.env.USER_AUTHENTICATION
        },
        body: {
          body: 'DATA GOES HERE'
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal(200);

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with default Error', function(done) {
      /*eslint-disable*/
      var schema = {
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
        url: 'http://localhost:10010/users/friends',
        json: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          X-Access-Token: process.env.USER_AUTHENTICATION
        },
        body: {
          body: 'DATA GOES HERE'
        }
      },
      function(error, res, body) {
        if (error) return done(error);

        expect(res.statusCode).to.equal('DEFAULT RESPONSE CODE HERE');

        expect(validator.validate(body, schema)).to.be.true;
        done();
      });
    });

  });

});
