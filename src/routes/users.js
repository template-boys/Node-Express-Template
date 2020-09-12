import express from 'express';
import config from '../../config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from "../models/User";
const { jwtSecret } = config;
const usersRouter = express.Router();

/**
 * @route   POST api/users/
 * @desc    Getting all users
 * @access  Public
 */
usersRouter.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({message: err.message})
  }
});

/**
 * @route   POST api/users/
 * @desc    Getting one user with id
 * @access  Public
 */
usersRouter.get('/:id', getUser, async (req, res) => {
  res.json(res.user);
});

/**
 * @route   POST api/users/
 * @desc    Delete user with id
 * @access  Public
 */
usersRouter.delete('/:id', getUser, async (req, res) => {
  try {
    await res.user.remove();
    res.json({message: 'Deleted User'});
  } catch (err) {
    res.status(500).json({ message: 'Cannot find user' });
  }
});

/**
 * @route   POST api/users/
 * @desc    Update user's info (not email or password) with id
 * @access  Public
 */
usersRouter.patch('/:id', getUser, async (req, res) => {
  const { name } = req.body;
  console.log(name);
  if (!name) {
    return res.status(400).json({ message: 'Please enter all fields' });
  } else {
    res.user.name = name;
  }

  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const user = await User.findOne({ email });
    if (user) throw Error('User already exists');

    const salt = await bcrypt.genSalt(10);
    if (!salt) throw Error('Something went wrong with encryption');

    const hash = await bcrypt.hash(password, salt);
    if (!hash) throw Error('Something went wrong when encrypting the password');

    const newUser = new User({
      name,
      email,
      password: hash
    });

    const savedUser = await newUser.save();
    if (!savedUser) throw Error('Something went wrong saving the user');

    const token = jwt.sign({ id: savedUser._id }, jwtSecret, {
      expiresIn: 3600
    });

    res.status(200).json({
      token,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email
      }
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
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
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Check for existing user
    const user = await User.findOne({ email });
    if (!user) throw Error('User Does not exist');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw Error('Invalid credentials');

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: 3600 });
    if (!token) throw Error('Could not sign the token');

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if(user == null) {
      return res.status(404).json({ message: 'Cannot find user'});
    }
  } catch (err) {
    return res.status(500).json({message: err.message});
  }

  res.user = user;
  next();
}

export default usersRouter;
