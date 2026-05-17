import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...')
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medreminder', {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    })
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Warning: ${error.message}`)
    console.warn('⚠️ App will start in limited mode - some features may not work')
  }
}

export default connectDB
