const Router = require('koa-router');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authRouter = new Router();

const secretKey = 'your-secret-key'; // Replace with a secure key for signing JWT

authRouter.post('/register', async (ctx) => {
  // ... (unchanged)

  try {
    // ... (unchanged)

    const token = generateToken(newUser); // Generate JWT

    ctx.status = 201; // Created
    ctx.body = { message: 'Registration successful', token };
  } catch (error) {
    ctx.status = 500; // Internal Server Error
    ctx.body = 'An error occurred during registration';
  }
});

authRouter.post('/login', async (ctx) => {
  // ... (unchanged)

  try {
    // ... (unchanged)

    const token = generateToken(user); // Generate JWT

    ctx.status = 200; // OK
    ctx.body = { message: 'Login successful', token };
  } catch (error) {
    ctx.status = 500; // Internal Server Error
    ctx.body = 'An error occurred during login';
  }
});

function generateToken(user) {
  const payload = {
    userId: user._id,
    username: user.username,
  };

  // Sign the JWT token
  return jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Adjust the expiration time as needed
}

module.exports = authRouter;
