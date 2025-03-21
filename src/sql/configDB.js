import { config } from 'dotenv'
import sql from 'mssql'
import process from 'node:process'

config()

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  server: process.env.SERVER,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    trustedConection: true
  },
  pool: {
    max: 15,
    min: 2,
    idleTimeoutMillis: 120000
  }
}

export const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then((pool) => {
    console.log('✔️ Conectado a SQL Server')
    return pool
  })
  .catch((err) => {
    console.error('❌ Error al conectar a la BD:', err)
    process.exit(1) // Cerrar la app si la BD no está disponible
  })
