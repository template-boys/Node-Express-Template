import express from 'express';
import auth from "../middleware/auth";
const indexRouter = express.Router();

indexRouter.get('/', auth, (req, res) => res.status(200).json({ message: "Hello World" }));

export default indexRouter;