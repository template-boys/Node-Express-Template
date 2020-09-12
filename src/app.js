import logger from 'morgan';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import indexRouter from './routes/index';
import usersRouter from "./routes/users";
import config from '../config';

const {mongoURI, mongoDbName} = config;

const app = express();
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// DB Config
const DB_URL = `${mongoURI}/${mongoDbName}`;

// Connect to Mongo
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('MongoDB Connected...'));

// Routes
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);

export default app;
