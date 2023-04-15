import { csrfCookieName, refreshCookieName } from '@src/configs/CookieConfigs.js';
import { JsonWebTokenError, jwtPromisified } from '@src/helpers/JwtHelpers.js';
import { MemcachedMethodError, memcached } from '@src/helpers/MemcachedHelpers.js';
import { createHash } from 'crypto';
import { RequestHandler } from 'express';

export const checkAnonymousCsrfToken: RequestHandler = async (req, res, next) => {
  // check hashed csrf token presence in cookie
  const hashedCsrfToken = req.signedCookies[csrfCookieName];
  if (!hashedCsrfToken) {
    return res.status(403).json({ message: 'valid anonymous csrf cookie not supplied' });
  }

  // check csrf token presence in header
  const csrfToken = req.headers['x-csrf-token'] as string;
  if (!csrfToken) {
    return res.status(403).json({ message: 'valid anonymous csrf token not supplied' });
  }

  // check csrf key presence in cache
  let csrfKey: string;
  try {
    csrfKey = (await memcached.get(csrfToken)).result as string;
  } catch (error) {
    if (error instanceof MemcachedMethodError) {
      if (error.message === 'cache miss') {
        return res.status(403).json({ message: 'valid anonymous csrf token expired or not supplied' });
      } else {
        return res.status(500).json({ message: 'memcached error', error });
      }
    }
    return res.status(500).json({ message: 'unknown error', error });
  }

  // check hashed csrf token validity
  const expectedHashedCsrfToken = createHash('sha256').update(`${csrfKey}${csrfToken}`).digest('hex');
  if (expectedHashedCsrfToken !== hashedCsrfToken) {
    return res.status(403).json({ message: 'valid anonymous csrf token not supplied' });
  }

  // prolong csrf key cache expire time
  try {
    await memcached.touch(csrfToken, 5 * 60);
  } catch (error) {
    if (error instanceof MemcachedMethodError) {
      console.log({ message: 'memcached error', error });
    }
    console.log({ message: 'unknown error', error });
  }

  // all check pass
  return next();
};

export const checkAuthorizedCsrfToken: RequestHandler = async (req, res, next) => {
  // check hashed csrf token presence in cookie
  const hashedCsrfToken = req.signedCookies[csrfCookieName];
  if (!hashedCsrfToken) {
    return res.status(403).json({ message: 'valid csrf cookie not supplied' });
  }

  // check csrf token presence in header
  const csrfToken = req.headers['x-csrf-token'] as string;
  if (!csrfToken) {
    return res.status(403).json({ message: 'valid csrf token not supplied' });
  }

  // check refresh token presence in cookie
  const refreshToken = req.signedCookies[refreshCookieName];
  if (!refreshToken) {
    return res.status(401).json({ message: 'valid refresh token not supplied' });
  }

  // check refresh token validity
  try {
    await jwtPromisified.verify(refreshToken);
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ message: 'valid refresh token not supplied' });
    }
  }

  // check csrf key presence in cache
  let csrfKey: string;
  try {
    csrfKey = (await memcached.get(refreshToken)).result as string;
  } catch (error) {
    if (error instanceof MemcachedMethodError) {
      if (error.message === 'cache miss') {
        return res.status(403).json({ message: 'valid csrf token expired or not supplied' });
      } else {
        return res.status(500).json({ message: 'memcached error', error });
      }
    }
    return res.status(500).json({ message: 'unknown error', error });
  }

  // check hashed csrf token validity
  const expectedHashedCsrfToken = createHash('sha256').update(`${csrfKey}${csrfToken}`).digest('hex');
  if (expectedHashedCsrfToken !== hashedCsrfToken) {
    return res.status(403).json({ message: 'valid csrf token not supplied' });
  }

  // prolong csrf key cache expire time
  try {
    await memcached.touch(refreshToken, 7 * 24 * 60 * 60);
  } catch (error) {
    if (error instanceof MemcachedMethodError) {
      console.log({ message: 'memcached error', error });
    }
    console.log({ message: 'unknown error', error });
  }

  // all check pass
  return next();
};
