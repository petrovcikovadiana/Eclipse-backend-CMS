const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const postRouter = require('./routes/postRoutes');
const configRouter = require('./routes/configRoutes');
const userRouter = require('./routes/userRoutes');
const tenantRouter = require('./routes/tenantRoutes');

const app = express();
app.use(cors());

// 1) GLOBAL MIDDLEWARES
console.log(process.env.NODE_ENV);
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('prod'));
} else {
  app.use(morgan('dev'));
}
// Limit requests from same API
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

if (process.env.NODE_ENV === 'production') {
  app.use('/api', limiter);
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      // Whitelist for duplicated filters
      // 'duration',
      // 'ratingsQuantity',
      // 'ratingsAverage',
      // 'maxGroupSize',
    ],
  }),
);

// Cookie parser
app.use(cookieParser());

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/configs', configRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tenants', tenantRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
