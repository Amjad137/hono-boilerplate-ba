import environment from '@/config/env.config';
import mongoose from 'mongoose';
import type { Db, MongoClient } from 'mongodb';

// Connecting to Database
const connect = async () => {
  // MongoDB URI
  const connString = environment.databaseURI;

  try {
    // Connect to Database
    await mongoose.connect(connString);
    console.log('⏫ database connection has been established successfully');
  } catch (e) {
    console.log(e);
  }
};

export const disconnect = async () => {
  try {
    console.log('⏬ database connection has been closed successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.log(error);
  }
};

export const getMongoClient = (): MongoClient => mongoose.connection.getClient();

export const getMongoDb = (): Db => {
  const { db } = mongoose.connection;
  if (!db)
    throw new Error(
      'MongoDB connection is not established. Ensure connect() has resolved before accessing the database.'
    );
  return db;
};

export default connect;
