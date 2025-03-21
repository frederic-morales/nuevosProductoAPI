import { poolPromise } from './configDB.js'
// import sql from 'mssql'

export class Usuarios {
  async getAll() {
    try {
      const pool = await poolPromise
      const result = await pool.request().query`
      SELECT CodigoEmpleado, Usuario, 
            Nombres, Apellidos, CorreoEmpresa 
            FROM GEN_USUARIOS
            WHERE CorreoEmpresa IS NOT NULL`

      // console.log(result.recordset)
      console.log('Traendo los usuarios')
      console.log('-------------------------')
      return result.recordset
    } catch (err) {
      console.error('Error al cerrar la conexión:', err)
    }
  }
}
