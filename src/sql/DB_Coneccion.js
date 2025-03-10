import sql from 'mssql'
import { config } from 'dotenv'

config()

const sqlConfig = {
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

// Connect to the database
async function connectAndQuery() {
  try {
    await sql.connect(sqlConfig) // SQL Query
    const result = await sql.query`SELECT * FROM IND_DESARROLLO_PRODUCTOS`
    console.dir(result.recordset) // Print results
  } catch (err) {
    console.error('Error trying to connect:', err) // Handle errors
  } finally {
    sql.close() // Close the connection when done
  }
}

// connectAndQuery()
async function insertEtapa(nombre, descripcion, tiempoEstimado) {
  try {
    await sql.connect(sqlConfig) // SQL Query
    const request = new sql.Request()

    request.input('Nombre', sql.VarChar(100), nombre)
    request.input('Descripcion', sql.VarChar(255), descripcion)
    request.input('TiempoEstimado', sql.Int, tiempoEstimado)

    const resultado = await request.query(`
        INSERT INTO IND_ETAPAS (Nombre, Descripcion, TiempoEstimado)
          VALUES(@Nombre, @Descripcion, @TiempoEstimado)
      `)

    console.log('El sultado es: ', resultado)
  } catch (error) {
    console.error('Error en la insercion: ', error)
  } finally {
    sql.close
  }
}

//F
