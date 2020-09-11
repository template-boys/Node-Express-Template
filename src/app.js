import logger from 'morgan';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import indexRouter from './routes/index';
import userRouter from "./routes/user";
import config from '../config';

const {mongoURI, mongoDbName} = config;

const app = express();
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// DB Config
const db = `${mongoURI}/${mongoDbName}`;

// Connect to Mongo
mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected...')
}).catch(err => console.log(err));

// Routes
app.use('/api', indexRouter);
app.use('/api/user', userRouter);

export default app;
