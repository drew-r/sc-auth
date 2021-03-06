var jwt = require('jsonwebtoken');

var scErrors = require('sc-errors');
var InvalidArgumentsError = scErrors.InvalidArgumentsError;

var AuthEngine = function () {};

AuthEngine.prototype.verifyToken = function (signedToken, keyOrKeyResolver, options, callback) {
  options = options || {};
  var jwtOptions = cloneObject(options);
  delete jwtOptions.async;
  if (typeof signedToken == 'string' || signedToken == null) {
    (typeof keyOrKeyResolver === 'function' ? keyOrKeyResolver(signedToken) : Promise.resolve(keyOrKeyResolver)).then(function(key) {
      if (options.async) {
        jwt.verify(signedToken || '', key, jwtOptions, callback);
      } else {
        var err = null;
        var token;
        try {
          token = jwt.verify(signedToken || '', key, jwtOptions);
        } catch (error) {
          err = error;
        }
        if (err) {
          callback(err);
        } else {
          callback(null, token);
        }
      }
    });
  } else {
    var err = new InvalidArgumentsError('Invalid token format - Token must be a string');
    callback(err);
  }
};

AuthEngine.prototype.signToken = function (token, keyOrKeyResolver, options, callback) {
  options = options || {};
  var jwtOptions = cloneObject(options);
  delete jwtOptions.async;
  (typeof keyOrKeyResolver === 'function' ? keyOrKeyResolver(token) : Promise.resolve(keyOrKeyResolver)).then(function(key) {
    if (options.async) {
      jwt.sign(token, key, jwtOptions, callback);
    } else {
      var signedToken;
      try {
        signedToken = jwt.sign(token, key, jwtOptions);
      } catch (err) {
        callback(err);
        return;
      }
      callback(null, signedToken);
    }
  });
};

function cloneObject(object) {
  var clone = {};
  Object.keys(object || {}).forEach(function (key) {
    clone[key] = object[key];
  });
  return clone;
}

module.exports.AuthEngine = AuthEngine;
