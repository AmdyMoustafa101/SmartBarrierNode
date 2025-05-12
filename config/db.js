const mongoose = require('mongoose');

db_url = process.env.MONGODB_CONNECT_URL;
if (!db_url) {
  console.error('MongoDB connection URL is not defined in .env file');
  process.exit(1); 
}

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(db_url);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1); 
  }
};

module.exports = connectDB;
