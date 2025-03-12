import { config } from 'dotenv'
import { process } from 'node'

config()

export const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  server: process.env.SERVER,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    trustedConection: false
  }
}
