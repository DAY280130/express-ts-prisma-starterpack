import { todoHandler } from '@src/handlers/TodoHandler.js';
import express from 'express';

export const todoRouter = express.Router();

const BASE_ROUTE = '/todo';
todoRouter.get(BASE_ROUTE, todoHandler.getAll);
