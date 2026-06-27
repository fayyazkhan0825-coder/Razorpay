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

// ================= CORS =================
const allowedOrigins = [
  "https://razorpay-mu-pearl.vercel.app",
  "https://razorpay-1-ba71.onrender.com",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
// ========================================

// Parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/', routes);

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Error handler
app.use(errorHandler);

// Server
const PORT =
  process.env.NODE_ENV === 'production'
    ? (process.env.PORT || 7002)
    : 7002;

const server = app.listen(PORT, () => {
  console.log(
    `[Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
  );
});

module.exports = server;