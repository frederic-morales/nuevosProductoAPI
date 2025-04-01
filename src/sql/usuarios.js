import { poolPromise } from './configDB.js'
import sql from 'mssql'

export class Usuarios {
  //-------------------------
  //  SELECTS
  //-------------------------

  //TRAE TODOS LOS USUARIOS
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

  //TRAE USUSARIOS POR GRUPO
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
      console.error('Error al traer los usuarios del grupo', CodigoGrupo, err)
    }
  }

  //VERIFICACION DE USUARIO - LOGIN
  async verificacionUsuario({ Usuario, Password }) {
    try {
      const pool = await poolPromise
      const request = await pool
        .request()
        .input('Usuario', sql.VarChar(20), Usuario)
        .input('Password', sql.VarChar(20), Password)

      const result = await request.execute('SP_VALIDACION_USUARIO')
      console.log('Verificacion:', result?.returnValue)
      return result?.returnValue
    } catch (err) {
      console.error('Error al validar el usuario', Usuario, err)
    }
  }

  //TRAE LA INFORMACION DEL USUARIO
  async informacionUsuario({ Usuario }) {
    try {
      const pool = await poolPromise
      const request = await pool
        .request()
        .input('Usuario', sql.VarChar(20), Usuario)
      const result =
        await request.query(`SELECT Usuario, CodigoGrupo, Nombres, Apellidos, 
                    CodigoProceso, CorreoEmpresa AS Correo 
	                  FROM GEN_USUARIOS WHERE Usuario = @Usuario`)

      console.log('Traendo usuario...', result?.recordset)
      return result.recordset
    } catch (err) {
      console.error('Error al traer usuario', Usuario, err)
    }
  }
}
