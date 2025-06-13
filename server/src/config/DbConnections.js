const mongoose = require('mongoose');



async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
}




module.exports=connectDB