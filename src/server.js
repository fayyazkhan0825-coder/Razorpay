const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);

const app = express();

// Enable CORS with credentials support (cookies)
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins in dev, or requests without origin (like mobile apps/curl)
    callback(null, true);
  },
  credentials: true
}));

// Parse JSON and urlencoded request bodies, and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Register routes
app.use('/', routes);

// 404 Route handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Global Error Handler
app.use(errorHandler);

// Force port 7002 for development, allow config for production
const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 7002) : 7002;

const server = app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = server;
