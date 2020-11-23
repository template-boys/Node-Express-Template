import express from 'express';
import { authenticate } from '../middleware/auth';
const indexRouter = express.Router();

indexRouter.get('/', authenticate, (req, res) =>
  res.status(200).json({ message: 'Hello World' })
);

export default indexRouter;
