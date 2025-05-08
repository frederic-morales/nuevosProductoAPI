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
      --WHERE CorreoEmpresa IS NOT NULL`

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
      // console.log('Verificacion:', result?.returnValue)
      return result?.returnValue
    } catch (err) {
      console.error('Error al validar el usuario 1', Usuario, err)
    }
  }

  //VERIFICAR SI USUARIO TIENE ETAPAS ASIGNADAS
  async verificarUsuarioEtapas({ Usuario }) {
    try {
      const pool = await poolPromise
      const request = await pool
        .request()
        .input('Usuario', sql.VarChar(20), Usuario)

      const result = await request.execute(`SP_USUARIO_ASIG_ETAPAS`)
      console.log('Verificando si el usuario tiene etapas asignadas...')
      console.log('Usuario:', Usuario)
      console.log('Resultado:', result?.returnValue)
      return result?.returnValue == 1 ? true : false
    } catch (err) {
      console.error('Error al validar el usuario 2', Usuario, err)
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

  //TRAE LAS ETAPAS ASIGNADAS AL USUARIO
  async getUsuarioEtapas({ Usuario, DesarrolloProductoId }) {
    try {
      const pool = await poolPromise
      const request = await pool
        .request()
        .input('Usuario', sql.VarChar(20), Usuario)
        .input('DesarrolloProductoId', sql.Int, DesarrolloProductoId)
      const result = await request.query(`  
          SELECT 
            DP.DesarrolloProductoId AS ProductoId,
            DP.Serie, DP.Rechazos, --DP.Usuario, 
            A.EtapasAsignadasId, A.EtapaId, A.Estado AS AsignacionEstado, A.Correlativo,
            E.Nombre, E.Descripcion, E.FechaCreacion, E.TiempoEstimado,
            GU.Usuario
          FROM IND_ETAPAS_ASIGNADAS A
            JOIN IND_ETAPAS E ON E.EtapaId = A.EtapaId
            JOIN IND_GRUPOS_USUARIOS_ETAPAS GU ON GU.EtapaId = E.EtapaId
            JOIN IND_DESARROLLO_PRODUCTOS DP ON DP.DesarrolloProductoId = A.DesarrolloProducto
          WHERE GU.Usuario = @Usuario 
          AND DP.DesarrolloProductoId = @DesarrolloProductoId
          AND A.Correlativo IS NULL
          ORDER BY DP.DesarrolloProductoId, A.EtapaId
          `)

      console.log('Traendo las etapas del usuario...', Usuario)
      return await result.recordset
    } catch (err) {
      console.error('Error al traer las etapas del usuario', Usuario, err)
    }
  }

  //TRAE LOS PRODUCTOS DONDE EL USUARIO TIENE ETAPAS
  async getProductosPorUsuario({ Usuario, Serie }) {
    try {
      const pool = await poolPromise
      const request = await pool
        .request()
        .input('Usuario', sql.VarChar(20), Usuario)
        .input('Serie', sql.Char(1), Serie)

      const result = await request.query(`
          SELECT 
            DP.DesarrolloProductoId, DP.Nombre, DP.Descripcion, DP.Usuario AS Responsable, DP.FechaInicio, DP.FechaFin, DP.Estado
            FROM IND_DESARROLLO_PRODUCTOS DP
            JOIN IND_ETAPAS_ASIGNADAS A ON DP.DesarrolloProductoId = A.DesarrolloProducto
            JOIN IND_ETAPAS E ON E.EtapaId = A.EtapaId
            JOIN IND_GRUPOS_USUARIOS_ETAPAS GU ON GU.EtapaId = E.EtapaId
          WHERE GU.Usuario = @Usuario 
          AND DP.Serie = @Serie
          AND A.Correlativo IS NULL
          GROUP BY DP.DesarrolloProductoId, DP.Nombre, DP.Descripcion, DP.Usuario, DP.FechaInicio, DP.FechaFin, DP.Estado`)
      console.log('Traendo los productos por usuario...')
      return await result.recordset
    } catch (err) {
      console.error('Error al traer las etapas del usuario', Usuario, err)
    }
  }
}
