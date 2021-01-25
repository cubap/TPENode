import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
let config = {}
if (envFound.error) {
  // Don't crash whole process
  // throw new Error("⚠️  Couldn't find .env file  ⚠️");
  config = {
    api: {
      prefix: '/api',
      jwtSecret: process.env.JWT_SECRET,
      jwtAlgorithm: process.env.JWT_ALGO
      }
  }
} else {
  config = {
    port: parseInt(process.env.PORT, 10),
    databaseURL: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtAlgorithm: process.env.JWT_ALGO,
    api: {
      prefix: '/api',
    }
  }
}

export default config

