

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Mongo connected successfully');
  } catch (error) {
    console.error('❌ Mongo connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
