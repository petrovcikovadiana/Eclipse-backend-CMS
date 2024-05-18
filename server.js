const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

if (!process.env.DATABASE_LOCAL) {
  throw new Error('DATABASE_LOCAL is not defined in config.env');
}

async function dbConnect() {
  try {
    await mongoose.connect(process.env.DATABASE_LOCAL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('DB connection established');
  } catch (err) {
    console.error('DB connection error:', err);
  }
}

dbConnect();

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
