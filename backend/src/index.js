import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import connectDB from './config/database.js'
import authRoutes from './routes/auth.js'
import familyRoutes from './routes/family.js'
import medicationRoutes from './routes/medications.js'
import reminderRoutes from './routes/reminders.js'
import consultRoutes from './routes/consult.js'
import ReminderEngine from './services/reminderEngine.js'

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/family', familyRoutes)
app.use('/api/medications', medicationRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api/consult', consultRoutes)

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MedReminder API is running',
    timestamp: new Date().toISOString()
  })
})

app.use((err, req, res, next) => {
  console.error('Error:', err)

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: '数据验证失败',
        details: Object.values(err.errors).map(e => ({
          field: e.path,
          message: e.message
        }))
      }
    })
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        type: 'DUPLICATE_ERROR',
        message: '资源已存在'
      }
    })
  }

  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      error: {
        type: 'NOT_FOUND',
        message: '资源不存在'
      }
    })
  }

  res.status(err.status || 500).json({
    success: false,
    error: {
      type: 'INTERNAL_ERROR',
      message: err.message || '服务器内部错误'
    }
  })
})

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
      
      ReminderEngine.start()
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
