import jwt from 'jsonwebtoken';
import User from '../models/User';
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

export const authenticate = async (req, res, next) => {
  const authToken = req.header('x-auth-token');

  // Check for token
  if (!authToken)
    return res.status(401).json({ msg: 'No token, authorizaton denied' });

  try {
    // Verify token
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    // Add user from payload
    req.user = await User.findById(decoded.id);
    next();
  } catch (e) {
    res.status(400).json({ msg: e.msg });
  }
};

export const adminAuthenticate = async (req, res, next) => {
  const authToken = req.header('x-auth-token');

  // Check for token
  if (!authToken)
    return res.status(401).json({ msg: 'No token, authorizaton denied' });

  try {
    // Verify token
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    // Add user from payload
    req.user = await User.findById(decoded.id);
    if (!req.user.admin) throw Error('Invalid authentication token');
    next();
  } catch (e) {
    res.status(400).json({ msg: e.msg });
  }
};

export const verify = async (req, res, next) => {
  const verifyToken = req.header('verification-token');

  // Check for token
  if (!verifyToken)
    return res.status(401).json({ msg: 'No token, authorizaton denied' });

  try {
    // Verify token
    const decoded = jwt.verify(verifyToken, process.env.JWT_SECRET);
    // Add user from payload
    req.user = await User.findById(decoded.id);
    next();
  } catch (e) {
    res.status(400).json({ msg: e.msg });
  }
};
