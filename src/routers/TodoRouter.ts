import { todoHandler } from '@src/handlers/TodoHandler.js';
import { Router } from 'express';

export const todoRouter = Router();

const BASE_ROUTE = '/todo';
todoRouter.get(BASE_ROUTE, todoHandler.getAll);
todoRouter.post(BASE_ROUTE, todoHandler.post);
