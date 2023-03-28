import { authHandler } from '@src/handlers/AuthHandler.js';
import { Router } from 'express';

export const authRouter = Router();

const BASE_ROUTE = '/auth';
authRouter.get(`${BASE_ROUTE}/token`, authHandler.generateCsrfToken);
authRouter.get(`${BASE_ROUTE}/token/verify`, authHandler.checkCsrfToken);
