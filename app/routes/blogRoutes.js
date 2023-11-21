const Router = require('koa-router');
const jwt = require('jsonwebtoken');
const Post = require('../models/post');

const blogRouter = new Router();
const secretKey = 'your-secret-key'; // Replace with the same key used in authRoutes.js

// Middleware to verify JWT token
blogRouter.use(async (ctx, next) => {
  const token = ctx.header.authorization;

  if (!token) {
    ctx.status = 401; // Unauthorized
    ctx.body = 'Token is missing';
    return;
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, secretKey);
    ctx.state.user = decoded; // Attach user information to the context state
    await next();
  } catch (error) {
    ctx.status = 401; // Unauthorized
    ctx.body = 'Invalid token';
  }
});

blogRouter.get('/posts', async (ctx) => {
  try {
    const posts = await Post.find();
    ctx.status = 200; // OK
    ctx.body = posts;
  } catch (error) {
    ctx.status = 500; // Internal Server Error
    ctx.body = 'An error occurred while fetching posts';
  }
});

blogRouter.post('/posts', async (ctx) => {
  const { title, content } = ctx.request.body;
  const userId = ctx.state.user.userId; // Get user ID from the token

  try {
    const newPost = new Post({
      title,
      content,
      userId,
    });

    await newPost.save();

    ctx.status = 201; // Created
    ctx.body = 'Post created successfully';
  } catch (error) {
    ctx.status = 500; // Internal Server Error
    ctx.body = 'An error occurred while creating a post';
  }
});

blogRouter.get('/posts/:id', async (ctx) => {
  const postId = ctx.params.id;

  try {
    const post = await Post.findById(postId);

    if (post) {
      ctx.status = 200; // OK
      ctx.body = post;
    } else {
      ctx.status = 404; // Not Found
      ctx.body = 'Post not found';
    }
  } catch (error) {
    ctx.status = 500; // Internal Server Error
    ctx.body = 'An error occurred while fetching the post';
  }
});

module.exports = blogRouter;
