import { RequestHandler } from 'express';

const getAll: RequestHandler = (req, res) => {
  res.status(200).json({
    route: '/todo',
    req: req.body,
  });
};

export const todoHandler = { getAll };
