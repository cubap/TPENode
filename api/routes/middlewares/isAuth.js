import jwt from 'express-jwt';
import config from '../../../config/index.js';

/**
 * We are assuming that the JWT will come in a header with the form
 *
 * Authorization: Bearer ${JWT}
 */
const getTokenFromHeader = req => {
  if (
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    return req.headers.authorization.split(' ')[1]
  }
  return null;
}

const isAuth = jwt({
  secret: config.jwtSecret || "forceWorkingAnyway", // The _secret_ to sign the JWTs
  algorithms: [config.jwtAlgorithm || 'HMAC'], // JWT Algorithm
  userProperty: 'token', // Use req.token to store the JWT
  getToken: getTokenFromHeader, // How to extract the JWT from the request
})

export default isAuth;