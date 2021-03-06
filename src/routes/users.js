import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import * as emailUtil from '../utils/emailUtil';
import {
  authenticate,
  adminAuthenticate,
  verify,
  resetPasswordAuth,
} from '../middleware/auth';
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const usersRouter = express.Router();

/**
 * @route   GET api/users/
 * @desc    Getting all users
 * @access  Public
 */
usersRouter.get('/', adminAuthenticate, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

/**
 * @route   GET api/users/
 * @desc    Getting one user with id
 * @access  Public
 */
usersRouter.get('/:id', adminAuthenticate, async (req, res) => {
  res.json(res.user);
});

/**
 * @route   DELETE api/users/
 * @desc    Delete user with id
 * @access  Public
 */
usersRouter.delete('/:id', authenticate, async (req, res) => {
  try {
    await res.user.remove();
    res.json({ message: 'Deleted User' });
  } catch (e) {
    res.status(500).json(e.message);
  }
});

/**
 * @route   PATCH api/users/
 * @desc    Update user's info (not email or password) with id
 * @access  Public
 */
usersRouter.patch('/:id', authenticate, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Please enter all fields' });
  } else {
    res.user.name = name;
  }

  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (e) {
    res.status(400).json(e.message);
  }
});

/**
 * @route   POST api/users/register
 * @desc    Register new user
 * @access  Public
 */
usersRouter.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      throw Error({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    if (!salt) {
      throw Error({ message: 'Something went wrong with encryption' });
    }

    const hash = await bcrypt.hash(password, salt);
    if (!hash) {
      throw Error({
        message: 'Something went wrong when encrypting the password',
      });
    }

    const newUser = new User({
      name,
      email,
      password: hash,
    });

    const savedUser = await newUser.save();
    if (!savedUser) {
      throw Error({ message: 'Something went wrong saving the user' });
    }

    // Send verification email
    emailUtil.sendVerificationEmail(savedUser, req.headers.origin);

    res.status(200).json({
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

/**
 * @route   POST api/users/login
 * @desc    Login user
 * @access  Public
 */
usersRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(401).json({ message: 'Please enter all fields' });
  }

  try {
    // Check for existing user
    const user = await User.findOne({ email });
    if (!user) {
      throw Error('User Does not exist');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user._id, tokenType: 'A' },
      process.env.JWT_SECRET,
      {
        expiresIn: 3600,
      }
    );
    if (!token) {
      throw Error({ message: 'Could not sign the token' });
    }

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (e) {
    res.status(401).json(e.message);
  }
});

/**
 * @route   POST api/users/verify_user
 * @desc    Check verification JWT
 * @access  Public
 */
usersRouter.post('/verify_user', verify, async (req, res) => {
  try {
    const user = req.user;
    user.verified = true;

    const verifiedUser = await user.save();
    res.json(verifiedUser);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

/**
 * @route   POST api/users/send_reset_password
 * @desc    Send password reset email
 * @access  Public
 */
usersRouter.post('/send_reset_password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw Error({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(200);
    }

    // Send reset password email
    emailUtil.sendResetPasswordEmail(user, req.headers.origin);

    res.json({ message: 'Password successfully reset' });
  } catch (e) {
    console.log('Failed');
    res.status(500).json(e.message);
  }
});

/**
 * @route   POST api/users/reset_password
 * @desc    Set user password with new password
 * @access  Public
 */
usersRouter.post('/reset_password', resetPasswordAuth, async (req, res) => {
  try {
    const user = req.user;
    const { newPassword } = req.body;
    if (!newPassword) {
      throw Error({ message: 'Please enter all fields' });
    }

    const salt = await bcrypt.genSalt(10);
    if (!salt) {
      throw Error({ message: 'Something went wrong with encryption' });
    }

    const hash = await bcrypt.hash(newPassword, salt);
    if (!hash) {
      throw Error({
        message: 'Something went wrong when encrypting the password',
      });
    }

    user.password = hash;
    await user.save();

    res.json({ message: 'Password successfully reset' });
  } catch (e) {
    res.status(500).json(e.message);
  }
});

/**
 * @route   POST api/users/ping
 * @desc    Check JWT
 * @access  Public
 */
usersRouter.post('/ping', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.json(false);
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (e) {
    res.status(500).json(e.message);
  }
});

export default usersRouter;
