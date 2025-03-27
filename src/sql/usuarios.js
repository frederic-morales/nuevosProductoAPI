import { poolPromise } from './configDB.js'
import sql from 'mssql'

export class Usuarios {
  async getAll() {
    try {
      const pool = await poolPromise
      const result = await pool.request().query`
      SELECT Usuario, CodigoEmpleado,
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

  async getGrupo({ CodigoGrupo = 35 }) {
    try {
      const pool = await poolPromise
      const request = await pool
        .request()
        .input('CodigoGrupo', sql.SmallInt, CodigoGrupo)
      const result = await request.query`
          SELECT Usuario, CodigoEmpleado,
              Nombres, Apellidos, CorreoEmpresa 
          FROM GEN_USUARIOS
          WHERE CodigoGrupo = @CodigoGrupo
        `
      console.log('Traendo los usuarios del grupo', CodigoGrupo)
      console.log('-------------------------------')
      return result.recordset
    } catch (err) {
      console.error('Error al traerl los usuarios del grupo', CodigoGrupo, err)
    }
  }
}
