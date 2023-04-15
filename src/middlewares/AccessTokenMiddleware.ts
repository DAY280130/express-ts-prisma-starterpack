import { ErrorResponse, logError } from '@src/helpers/HandlerHelpers.js';
import { JsonWebTokenError, TokenExpiredError, jwtPromisified } from '@src/helpers/JwtHelpers.js';
import { RequestHandler } from 'express';

const ACCESS_TOKEN_NOT_VALID_MESSAGE = 'valid access token not supplied';
const ACCESS_TOKEN_EXPIRED = 'access token expired, please refresh access token';

export const checkAccessToken: RequestHandler = async (req, res, next) => {
  try {
    // check access token presence in header
    const accessTokenHeader = req.headers['Authorization'] as string;
    if (!accessTokenHeader) throw new Error(ACCESS_TOKEN_NOT_VALID_MESSAGE);
    const accessToken = accessTokenHeader.split(' ')[1];
    if (!accessToken) throw new Error(ACCESS_TOKEN_NOT_VALID_MESSAGE);

    // verify access token
    await jwtPromisified.verify(accessToken);

    // all check pass
    next();
  } catch (error) {
    // catch no access token error
    if (
      (error instanceof Error && error.message === ACCESS_TOKEN_NOT_VALID_MESSAGE) ||
      error instanceof JsonWebTokenError
    ) {
      logError(`${req.path} : checkAccessToken middleware`, error, true);
      return res.status(401).json({
        status: 'error',
        message: ACCESS_TOKEN_NOT_VALID_MESSAGE,
      } satisfies ErrorResponse);
    }

    // catch expired access token error
    if (error instanceof TokenExpiredError) {
      logError(`${req.path} : checkAccessToken middleware`, error, true);
      return res.status(401).json({
        status: 'error',
        message: ACCESS_TOKEN_EXPIRED,
      } satisfies ErrorResponse);
    }

    logError(`${req.path} : checkAccessToken middleware`, error, 'unset');
    return res.status(500).json({
      status: 'error',
      message: 'internal error',
    } satisfies ErrorResponse);
  }
};
