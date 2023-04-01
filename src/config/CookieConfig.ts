import { CookieOptions } from 'express';

export const cookieConfig: CookieOptions = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  signed: true,
  secure: false,
};

export const csrfCookieName = `__Host-${process.env.DOMAIN || 'api.com'}.x-csrf-token`;

export const refreshCookieName = `__Host-${process.env.DOMAIN || 'api.com'}.x-refresh-token`;
