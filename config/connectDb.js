require('dotenv').config();
const mongoose = require('mongoose');
const source = process.env.MONGODB_URI;
const connectDb = async () => {
  try {
    await mongoose.connect(source, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};
module.exports = connectDb;