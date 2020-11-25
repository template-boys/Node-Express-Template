import logger from 'morgan';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import indexRouter from './routes/index';
import usersRouter from './routes/users';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to Mongo
mongoose.connect(`${process.env.MONGO_URI}/${process.env.MONGO_DB_NAME}`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () =>
  console.log(`MongoDB:${process.env.MONGO_DB_NAME} Connected...`)
);

// API Routes
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);

// Hello App
app.use('/', (req, res) => {
  res.json({ message: 'Hello Template' });
});

app.listen(process.env.PORT || 5000);

export default app;
