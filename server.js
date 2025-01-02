// Import required modules
const mongoose = require('mongoose'); 
const dotenv = require('dotenv');

// Load environment variables from the configuration file
dotenv.config({ path: './config.env' });
const app = require('./app'); // Import the main application module

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('err', err.name, err.message); 
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1); 
});

// Ensure the required database environment variable is set
if (!process.env.DATABASE_LOCAL) {
  throw new Error('DATABASE_LOCAL is not defined in config.env');
}

// Function to establish a connection to the MongoDB database
async function dbConnect() {
  try {
    await mongoose.connect(process.env.DATABASE_LOCAL); // Connect using the environment variable
    console.log('DB connection established'); 
  } catch (err) {
    console.error('DB connection error:', err);
  }
}

// Call the database connection function and handle any errors
dbConnect().catch((err) => console.error(err));

// Define the port for the server to listen on (default to 8000 if not defined in the environment)
const port = process.env.PORT || 8000;

// Start the server and listen for incoming connections
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`); 
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message); 
  server.close(() => {
    process.exit(1); // Close the server and exit the process with failure code
  });
});
