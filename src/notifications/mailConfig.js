import nodeMailer from 'nodemailer'
import process from 'node:process'
import { config } from 'dotenv'

config()

const transporter = nodeMailer.createTransport({
  host: process.env.HOST,
  port: process.env.PORTMAIL,
  secure: false,
  auth: {
    user: process.env.LOCALMAIL,
    pass: process.env.PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
})

export default transporter
