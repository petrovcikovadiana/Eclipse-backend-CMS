const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

if (!process.env.DATABASE_LOCAL) {
  throw new Error('DATABASE_LOCAL is not defined in config.env');
}

async function dbConnect() {
  try {
    await mongoose.connect(process.env.DATABASE_LOCAL);
    console.log('DB connection established');
  } catch (err) {
    console.error('DB connection error:', err);
  }
}

dbConnect().catch((err) => console.error(err));

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
