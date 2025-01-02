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
const employeeRouter = require('./routes/employeeRoutes');
const configRouter = require('./routes/configRoutes');
const userRouter = require('./routes/userRoutes');
const priceListRouter = require('./routes/priceListRoutes');
const tenantRouter = require('./routes/tenantRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const path = require('path');

const app = express();
// Add CORS fot different ports
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5501'],
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
    credentials: true,
  }),
);

// Serving static files
app.use(
  '/img/employees',
  express.static(path.join(__dirname, 'public/img/employees')),
);

app.use('/img/employees', (req, res) => {
  res.status(404).send('Image not found.');
});
// 1) GLOBAL MIDDLEWARES
console.log('process.env.NODE_ENV', process.env.NODE_ENV);
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
// Order pricelist
app.put('/api/v1/tenants/order-priceLists', async (req, res) => {
  const { priceLists } = req.body; // Accepts an array of IDs in a new order.
  const tenantId = req.tenantId; // Assumed that tenantId is available in the middleware

  if (!priceLists || !Array.isArray(priceLists)) {
    return res
      .status(400)
      .json({ error: 'Invalid request. Expected an array of IDs.' });
  }

  try {
    // Loop to update the order
    for (let i = 0; i < priceLists.length; i++) {
      const id = priceLists[i];
      await PriceList.updateOne(
        { _id: id, tenantId }, // Condition
        { $set: { order: i } }, // Nastavení nového pořadí
      );
    }

    return res.status(200).json({ message: 'Order updated successfully.' });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ error: 'Failed to update order.' });
  }
});

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
app.use('/api/v1/priceLists', priceListRouter);
app.use('/api/v1/employees', employeeRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tenants', tenantRouter);

app.post('/api/v1/tenants/:tenantId/categories', (req, res) => {
});

// global error for testing
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.message);

  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'Internal Server Error',
    error: {
      code: err.code || 'UNKNOWN_ERROR',
      statusCode: err.statusCode || 500,
    },
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
