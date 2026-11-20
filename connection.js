const mongoose = require('mongoose');
require('dotenv').config({ quiet: true });
mongoose.set('strictQuery', true);

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(() => console.log('connected to mongodb'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
