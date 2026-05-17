import nodemailer from 'nodemailer'
import webpush from 'web-push'
import axios from 'axios'

class NotificationService {
  constructor() {
    this.vapidPublicKey = process.env.VAPID_PUBLIC_KEY
    this.vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
    this.vapidSubject = process.env.VAPID_SUBJECT || 'mailto:noreply@example.com'

    if (this.vapidPublicKey && this.vapidPrivateKey) {
      webpush.setVapidDetails(
        this.vapidSubject,
        this.vapidPublicKey,
        this.vapidPrivateKey
      )
    }

    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })

    this.pushSubscriptions = new Map()
  }

  async sendWebPush(userId, notification) {
    try {
      const subscription = this.pushSubscriptions.get(userId.toString())
      
      if (!subscription) {
        console.log('No push subscription found for user:', userId)
        return false
      }

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: notification.data
      })

      await webpush.sendNotification(subscription, payload)
      return true
    } catch (error) {
      console.error('Web Push Error:', error)
      return false
    }
  }

  async sendSMS(phoneNumber, message) {
    try {
      if (!process.env.ALIYUN_SMS_ACCESS_KEY_ID || !process.env.ALIYUN_SMS_ACCESS_KEY_SECRET) {
        console.log('SMS service not configured')
        return false
      }

      const params = {
        PhoneNumbers: phoneNumber,
        SignName: process.env.ALIYUN_SMS_SIGN_NAME || '用药提醒',
        TemplateCode: 'SMS_xxxxx',
        TemplateParam: JSON.stringify({ message })
      }

      console.log('SMS would be sent to:', phoneNumber, 'with message:', message)
      return true
    } catch (error) {
      console.error('SMS Error:', error)
      return false
    }
  }

  async sendEmail(to, subject, text) {
    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log('Email service not configured')
        return false
      }

      const mailOptions = {
        from: `"MedReminder" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #409EFF;">${subject}</h2>
            <p style="font-size: 16px; line-height: 1.6;">${text}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              这是一封自动发送的邮件，请勿回复。<br>
              如有问题，请联系客服。
            </p>
          </div>
        `
      }

      await this.emailTransporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.error('Email Error:', error)
      return false
    }
  }

  async sendMedicationReminder(reminderData) {
    const { userId, medication, scheduledTime, familyMemberName } = reminderData

    const notification = {
      title: '服药提醒 💊',
      body: `该服用 ${medication.name} 了${familyMemberName ? `（' + ${familyMemberName}）' : ''}。\n剂量：${medication.dosage || '请遵医嘱'}`,
      data: {
        type: 'medication_reminder',
        medicationId: medication._id,
        reminderId: reminderData._id,
        timestamp: Date.now()
      }
    }

    await this.sendWebPush(userId, notification)
  }

  registerPushSubscription(userId, subscription) {
    this.pushSubscriptions.set(userId.toString(), subscription)
  }

  removePushSubscription(userId) {
    this.pushSubscriptions.delete(userId.toString())
  }

  getVapidPublicKey() {
    return this.vapidPublicKey
  }
}

export default new NotificationService()
