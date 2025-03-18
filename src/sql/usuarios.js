import { sqlConfig } from './configDB.js'
import sql from 'mssql'

export class Usuarios {
  constructor() {
    this.connection = null
  }

  // Abrir la conexion a la DB
  async connect() {
    try {
      this.connection = await sql.connect(sqlConfig)
      console.log('Conexión establecida!!')
    } catch (err) {
      console.error('Error al conectar:', err)
    }
  }

  //Cerrar la conexion de la DB
  async close() {
    try {
      if (this.connection) {
        await this.connection.close()
        console.log('Conexión cerrada!!')
      }
    } catch (err) {
      console.error('Error al cerrar la conexión:', err)
    }
  }

  //Trae todos los usuarios con correo asignado
  async getAll() {
    try {
      await this.connect()
      const result = await sql.query`SELECT CodigoEmpleado, Usuario, 
            Nombres, Apellidos, CorreoEmpresa 
            FROM GEN_USUARIOS
            WHERE CorreoEmpresa IS NOT NULL`
      console.log(result.recordset)
      return result.recordset
    } catch (err) {
      console.error('Error al cerrar la conexión:', err)
    } finally {
      await this.close()
    }
  }
}
