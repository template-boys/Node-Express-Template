import jwt from 'jsonwebtoken';
import User from '../models/User';
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

export const authenticate = async (req, res, next) => {
  const authToken = req.header('x-auth-token');

  // Check for token
  if (!authToken) {
    return res.status(401).json({ message: 'No token, authorizaton denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    if (decoded.tokenType === 'A') {
      // Add user from payload
      req.user = await User.findById(decoded.id);
      next();
    } else {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};

export const adminAuthenticate = async (req, res, next) => {
  const authToken = req.header('x-auth-token');

  // Check for token
  if (!authToken) {
    return res.status(401).json({ message: 'No token, authorizaton denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    // Add user from payload
    req.user = await User.findById(decoded.id);
    if (!req.user.admin) {
      throw Error({ message: 'Invalid authentication token' });
    }
    next();
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const verify = async (req, res, next) => {
  const verifyToken = req.header('verification-token');

  // Check for token
  if (!verifyToken) {
    return res.status(401).json({ message: 'No token, authorizaton denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(verifyToken, process.env.JWT_SECRET);
    if (decoded.tokenType === 'V') {
      // Add user from payload
      req.user = await User.findById(decoded.id);
      next();
    } else {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};

export const resetPasswordAuth = async (req, res, next) => {
  const passwordResetToken = req.header('reset-password-token');

  // Check for token
  if (!passwordResetToken) {
    throw Error({ message: 'No token, authorizaton denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(passwordResetToken, process.env.JWT_SECRET);
    if (decoded.tokenType === 'R') {
      // Add user from payload
      req.user = await User.findById(decoded.id);
      next();
    } else {
      throw Error({ message: 'Invalid token' });
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};
