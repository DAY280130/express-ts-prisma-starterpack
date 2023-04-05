import { csrfCookieName } from '@src/configs/CookieConfigs.js';
import { MemcachedMethodError, memcached } from '@src/helpers/MemcachedHelpers.js';
import { ExpressMiddleware } from '@src/helpers/MiddlewareHelpers.js';
import { createHash } from 'crypto';

export const checkAnonymousCsrfToken: ExpressMiddleware = async (req, res, next) => {
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

  // check csrf key presence in cache
  let csrfKey: string;
  try {
    csrfKey = (await memcached.get(csrfToken)).result as string;
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

  // prolong csrf key cache expire time
  try {
    await memcached.touch(csrfToken, 5 * 60);
  } catch (error) {
    if (error instanceof MemcachedMethodError) {
      console.log({ message: 'memcached error', error });
    }
    console.log({ message: 'unknown error', error });
  }

  // check hashed csrf token validity
  const expectedHashedCsrfToken = createHash('sha256').update(`${csrfKey}${csrfToken}`).digest('hex');
  if (expectedHashedCsrfToken !== hashedCsrfToken) {
    return res.status(403).json({ message: 'valid csrf token not supplied' });
  }

  // all check pass
  return next();
};
