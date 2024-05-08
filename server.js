const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   encodeURIComponent(process.env.DATABASE_PASSWORD),
// );

async function dbConnect() {
  await mongoose
    // .connect(DB, {
    .connect(process.env.DATABASE_LOCAL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('DB connection established'));
}

dbConnect().catch((err) => console.error(err));

const port = process.env.PORT || 8000; // Corrected the port number
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
