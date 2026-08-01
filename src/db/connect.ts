import * as dns from 'dns';
import mongoose from 'mongoose';

export async function connectToDatabase() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined. Atlas connection is required.');
  }

  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (error) {
    console.warn('Unable to set DNS servers for Atlas SRV resolution:', (error as Error).message);
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000
  });

  console.log('Connected to Atlas');
  return mongoose.connection;
}
