import request from 'supertest'
import mongoose from 'mongoose'
import app from '../src/index.js'

describe('API Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medreminder_test')
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('running')
    })
  })

  describe('User Registration', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
        .expect(201)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data.user.email).toBe('test@example.com')
    })

    it('should reject duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(409)
    })

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error.type).toBe('VALIDATION_ERROR')
    })
  })

  describe('User Login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('token')
    })

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401)
      
      expect(response.body.success).toBe(false)
    })
  })

  describe('Family Members', () => {
    let authToken

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
      
      authToken = loginResponse.body.data.token
    })

    it('should add a family member', async () => {
      const response = await request(app)
        .post('/api/family/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '爷爷',
          role: 'member',
          age: 70
        })
        .expect(201)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('爷爷')
      expect(response.body.data.role).toBe('member')
    })

    it('should get family members', async () => {
      const response = await request(app)
        .get('/api/family/members')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })

    it('should reject request without auth', async () => {
      await request(app)
        .get('/api/family/members')
        .expect(401)
    })
  })

  describe('Medications', () => {
    let authToken

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
      
      authToken = loginResponse.body.data.token
    })

    it('should add a medication', async () => {
      const response = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '阿司匹林',
          dosage: '100mg',
          frequency: '每日1次',
          timing: '饭后'
        })
        .expect(201)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('阿司匹林')
    })

    it('should get medications', async () => {
      const response = await request(app)
        .get('/api/medications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should require medication name', async () => {
      const response = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)
      
      expect(response.body.success).toBe(false)
    })
  })
})
