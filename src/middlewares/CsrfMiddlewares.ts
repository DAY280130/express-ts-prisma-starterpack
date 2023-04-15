import { cookieConfig, csrfCookieName, refreshCookieName } from '@src/configs/CookieConfigs.js';
import { ErrorResponse, logError } from '@src/helpers/HandlerHelpers.js';
import { JsonWebTokenError, TokenExpiredError, jwtPromisified } from '@src/helpers/JwtHelpers.js';
import { MemcachedMethodError, memcached } from '@src/helpers/MemcachedHelpers.js';
import { createHash } from 'crypto';
import { RequestHandler, Response } from 'express';

const ANONYM_CSRF_TOKEN_NOT_VALID_MESSAGE = 'valid anonymous csrf token not supplied';
const ANONYM_CSRF_TOKEN_EXPIRED = 'valid anonymous csrf token expired or not supplied';
const CSRF_TOKEN_NOT_VALID_MESSAGE = 'valid csrf token not supplied';
const CSRF_TOKEN_EXPIRED = 'valid csrf token expired or not supplied';
const REFRESH_TOKEN_NOT_VALID_MESSAGE = 'valid refresh token not supplied';
const REFRESH_TOKEN_EXPIRED = 'refresh token expired';

export const checkAnonymousCsrfToken: RequestHandler = async (req, res, next) => {
  try {
    // check hashed csrf token presence in cookie
    const hashedCsrfToken = req.signedCookies[csrfCookieName];
    if (!hashedCsrfToken) throw new Error(ANONYM_CSRF_TOKEN_NOT_VALID_MESSAGE);

    // check csrf token presence in header
    const csrfToken = req.headers['x-csrf-token'] as string;
    if (!csrfToken) throw new Error(ANONYM_CSRF_TOKEN_NOT_VALID_MESSAGE);

    // get csrf key in cache
    const csrfKey = (await memcached.get(csrfToken)).result as string;

    // check hashed csrf token validity
    const expectedHashedCsrfToken = createHash('sha256').update(`${csrfKey}${csrfToken}`).digest('hex');
    if (expectedHashedCsrfToken !== hashedCsrfToken) throw new Error(ANONYM_CSRF_TOKEN_NOT_VALID_MESSAGE);

    // prolong csrf key cache expire time
    try {
      await memcached.touch(csrfToken, 5 * 60);
    } catch (error) {
      if (error instanceof MemcachedMethodError) {
        logError(`${req.path} : checkAnonymousCsrfToken > memcached error`, error, true);
      }
      logError(`${req.path} : checkAnonymousCsrfToken`, error, false);
    }

    // all check pass
    return next();
  } catch (error) {
    // catch no valid csrf token error
    if (error instanceof Error && error.message === ANONYM_CSRF_TOKEN_NOT_VALID_MESSAGE) {
      return res.status(403).json({
        status: 'error',
        message: ANONYM_CSRF_TOKEN_NOT_VALID_MESSAGE,
      } satisfies ErrorResponse);
    }

    // catch memcached error
    if (error instanceof MemcachedMethodError) {
      // catch expired or no valid csrf token error
      if (error.message === 'cache miss') {
        return res.status(403).json({
          status: 'error',
          message: ANONYM_CSRF_TOKEN_EXPIRED,
        } satisfies ErrorResponse);
      } else {
        logError(`${req.path} : checkAnonymousCsrfToken > memcached error`, error, true);
        return res.status(500).json({
          status: 'error',
          message: 'internal memcached error',
        } satisfies ErrorResponse);
      }
    }

    logError(`${req.path} : checkAnonymousCsrfToken`, error, false);
    return res.status(500).json({
      status: 'error',
      message: 'internal error',
    } satisfies ErrorResponse);
  }
};

const clearCookie = (res: Response) => {
  res.clearCookie(csrfCookieName, cookieConfig);
  res.clearCookie(refreshCookieName, cookieConfig);
};

export const checkAuthorizedCsrfToken: RequestHandler = async (req, res, next) => {
  try {
    // check hashed csrf token presence in cookie
    const hashedCsrfToken = req.signedCookies[csrfCookieName];
    if (!hashedCsrfToken) throw new Error(CSRF_TOKEN_NOT_VALID_MESSAGE);

    // check csrf token presence in header
    const csrfToken = req.headers['x-csrf-token'] as string;
    if (!csrfToken) throw new Error(CSRF_TOKEN_NOT_VALID_MESSAGE);

    // check refresh token presence in cookie
    const refreshToken = req.signedCookies[refreshCookieName];
    if (!refreshToken) throw new Error(REFRESH_TOKEN_NOT_VALID_MESSAGE);

    // check refresh token validity
    await jwtPromisified.verify(refreshToken);

    // get csrf key in cache
    const csrfKey = (await memcached.get(refreshToken)).result as string;

    // check hashed csrf token validity
    const expectedHashedCsrfToken = createHash('sha256').update(`${csrfKey}${csrfToken}`).digest('hex');
    if (expectedHashedCsrfToken !== hashedCsrfToken) throw new Error(CSRF_TOKEN_NOT_VALID_MESSAGE);

    // prolong csrf key cache expire time
    try {
      await memcached.touch(refreshToken, 7 * 24 * 60 * 60);
    } catch (error) {
      if (error instanceof MemcachedMethodError) {
        logError(`${req.path} : checkAuthorizedCsrfToken > memcached error`, error, true);
      }
      logError(`${req.path} : checkAuthorizedCsrfToken`, error, false);
    }

    // all check pass
    return next();
  } catch (error) {
    // catch no valid csrf token error
    if (error instanceof Error && error.message === CSRF_TOKEN_NOT_VALID_MESSAGE) {
      clearCookie(res);
      return res.status(403).json({
        status: 'error',
        message: CSRF_TOKEN_NOT_VALID_MESSAGE,
      } satisfies ErrorResponse);
    }

    // catch memcached error
    if (error instanceof MemcachedMethodError) {
      // catch expired or no valid csrf token error
      if (error.message === 'cache miss') {
        clearCookie(res);
        return res.status(403).json({
          status: 'error',
          message: CSRF_TOKEN_EXPIRED,
        } satisfies ErrorResponse);
      } else {
        logError(`${req.path} : checkAnonymousCsrfToken > memcached error`, error, true);
        return res.status(500).json({
          status: 'error',
          message: 'internal memcached error',
        } satisfies ErrorResponse);
      }
    }

    // catch refresh token expired error
    if (error instanceof TokenExpiredError) {
      clearCookie(res);
      return res.status(401).json({
        status: 'error',
        message: REFRESH_TOKEN_EXPIRED,
      } satisfies ErrorResponse);
    }

    // catch no valid refresh token error
    if (
      (error instanceof Error && error.message === REFRESH_TOKEN_NOT_VALID_MESSAGE) ||
      error instanceof JsonWebTokenError
    ) {
      clearCookie(res);
      return res.status(401).json({
        status: 'error',
        message: REFRESH_TOKEN_NOT_VALID_MESSAGE,
      } satisfies ErrorResponse);
    }

    logError(`${req.path} : checkAnonymousCsrfToken`, error, false);
    return res.status(500).json({
      status: 'error',
      message: 'internal error',
    } satisfies ErrorResponse);
  }
};
