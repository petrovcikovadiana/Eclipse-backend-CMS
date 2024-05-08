const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const postRouter = require('./routes/postRoutes');
const configRouter = require('./routes/configRoutes');

const app = express();
app.use(cors());

//1) MIDDLEWARES
console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/configs', configRouter);

module.exports = app;
