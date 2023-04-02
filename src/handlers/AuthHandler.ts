import { cookieConfig, csrfCookieName } from '@src/config/CookieConfig.js';
import { MemcachedMethodError, memcached } from '@src/db/MemcachedClientInstance.js';
import { createHash, randomBytes } from 'crypto';
import { RequestHandler } from 'express';

const generateCsrfToken: RequestHandler = (_req, res) => {
  const csrfKey = randomBytes(16).toString('hex');
  const csrfToken = randomBytes(32).toString('hex');
  const hashedCsrfToken = createHash('sha256').update(`${csrfKey}${csrfToken}`).digest('hex');

  // csrfTempMap.set(csrfToken, csrfKey);
  try {
    memcached.set(csrfToken, csrfKey, 300);
  } catch (error) {
    return res.status(500).json({ message: 'failed generating internal token', error });
  }

  res.cookie(csrfCookieName, hashedCsrfToken, cookieConfig);

  return res.status(200).json({ csrfToken });
};

const checkCsrfToken: RequestHandler = async (req, res) => {
  const hashedCsrfToken = req.signedCookies[csrfCookieName];
  if (!hashedCsrfToken) {
    return res.status(403).json({ message: 'csrf cookie not found' });
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  if (!csrfToken) {
    return res.status(403).json({ message: 'csrf header not found' });
  }

  let csrfKey: string;
  try {
    csrfKey = (await memcached.get(csrfToken)).result as string;
  } catch (error) {
    if (error instanceof MemcachedMethodError) {
      if (error.message === 'cache miss') {
        return res.status(403).json({ message: 'csrf key not found' });
      } else {
        return res.status(500).json({ message: 'memcached error', error });
      }
    }
    return res.status(500).json({ message: 'unknown error', error });
  }

  const expectedHashedCsrfToken = createHash('sha256').update(`${csrfKey}${csrfToken}`).digest('hex');

  if (expectedHashedCsrfToken !== hashedCsrfToken) {
    return res.status(403).json({ message: 'csrf token not match' });
  }

  return res.status(200).json({
    message: 'CSRF token verified',
    csrfKey,
    csrfToken,
    hashedCsrfToken,
  });
};

export const authHandler = { generateCsrfToken, checkCsrfToken };
