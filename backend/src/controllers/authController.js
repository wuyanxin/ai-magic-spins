import { validationResult } from 'express-validator'
import { User, Family } from '../models/index.js'
import { generateToken } from '../middlewares/auth.js'

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '验证失败',
          details: errors.array()
        }
      })
    }
    
    const { email, password, name, phone } = req.body
    
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          type: 'DUPLICATE_ERROR',
          message: '该邮箱已被注册'
        }
      })
    }
    
    const user = new User({
      email,
      password,
      name,
      phone
    })
    
    await user.save()
    
    const family = new Family({
      name: `${name || '我的'}的家庭`,
      ownerId: user._id
    })
    await family.save()
    
    user.familyId = family._id
    await user.save()
    
    const token = generateToken(user._id)
    
    user.lastLoginAt = new Date()
    await user.save()
    
    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      },
      message: '注册成功'
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '验证失败',
          details: errors.array()
        }
      })
    }
    
    const { email, password } = req.body
    
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: '邮箱或密码错误'
        }
      })
    }
    
    const isMatch = await user.comparePassword(password)
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: '邮箱或密码错误'
        }
      })
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: '账户已被禁用'
        }
      })
    }
    
    const token = generateToken(user._id)
    
    user.lastLoginAt = new Date()
    await user.save()
    
    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      },
      message: '登录成功'
    })
  } catch (error) {
    next(error)
  }
}

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate('familyId')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '用户不存在'
        }
      })
    }
    
    res.json({
      success: true,
      data: user.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, avatar },
      { new: true, runValidators: true }
    )
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '用户不存在'
        }
      })
    }
    
    res.json({
      success: true,
      data: user.toJSON(),
      message: '个人信息更新成功'
    })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '验证失败',
          details: errors.array()
        }
      })
    }
    
    const { currentPassword, newPassword } = req.body
    
    const user = await User.findById(req.userId).select('+password')
    
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: '当前密码错误'
        }
      })
    }
    
    user.password = newPassword
    await user.save()
    
    res.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    next(error)
  }
}
