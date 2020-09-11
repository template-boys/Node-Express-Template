import dotenv from 'dotenv';
dotenv.config();
export default {
    jwtSecret: process.env.JWT_SECRET,
    mongoURI: process.env.MONGO_URI,
    mongoDbName: process.env.MONGO_DB_NAME
}