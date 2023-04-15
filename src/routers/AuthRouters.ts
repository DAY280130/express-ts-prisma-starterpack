import { authHandlers } from '@src/handlers/AuthHandlers.js';
import { checkAccessToken } from '@src/middlewares/AccessTokenMiddleware.js';
import { checkAnonymousCsrfToken, checkAuthorizedCsrfToken } from '@src/middlewares/CsrfMiddlewares.js';
import { Router } from 'express';

export const authRouters = Router();

const BASE_ROUTE = '/auth';
authRouters.get(`${BASE_ROUTE}/token`, authHandlers.generateCsrfToken);
// authRouters.get(`${BASE_ROUTE}/token/verify`, authHandlers.checkCsrfToken);
authRouters.post(`${BASE_ROUTE}/login`, checkAnonymousCsrfToken, authHandlers.login);
authRouters.post(`${BASE_ROUTE}/register`, checkAnonymousCsrfToken, authHandlers.register);
authRouters.post(`${BASE_ROUTE}/refresh`, checkAuthorizedCsrfToken, authHandlers.refresh);
authRouters.get(`${BASE_ROUTE}/check`, checkAuthorizedCsrfToken, checkAccessToken, authHandlers.checkSession);
