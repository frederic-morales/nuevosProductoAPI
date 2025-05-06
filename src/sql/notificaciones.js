import { poolPromise } from './configDB.js'
import sql from 'mssql'

export class Notificaciones_sql {
  //TRAE LA INFORMACION DE LA ETAPA Y EL USUARIO PARA ENVIAR LA NOTIFICACION POR MAIL
  async getEtapaUsuario({ DesarrolloProductoId, EtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProductoId', sql.Int, DesarrolloProductoId)
        .input('EtapaId', sql.Int, EtapaId)
      const resultado = await request.query(`
              SELECT P.ProgresoEtapaId, P.Correlativo, P.Estado AS ProgresoEstado, P.FechaInicio,
                D.DesarrolloProductoId, D.Nombre AS NombreProducto,  D.Serie,
                E.Nombre AS NombreEtapa, E.EtapaId, E.TiempoEstimado,
                U.Nombres, U.Apellidos, U.CorreoEmpresa AS Correo
              FROM IND_PROGRESO_ETAPAS P
                JOIN IND_DESARROLLO_PRODUCTOS D ON P.DesarrolloProducto = D.DesarrolloProductoId
                JOIN IND_ETAPAS E ON E.EtapaId = P.Etapa
                JOIN GEN_USUARIOS U ON U.Usuario = D.Usuario
              WHERE P.DesarrolloProducto = @DesarrolloProductoId AND E.EtapaId = @EtapaId`)

      console.log('Traendo la informacion de la etapa con el usuario')
      console.log('-------------------------')
      return await resultado?.recordset[0]
    } catch (err) {
      console.error('Error al traer la etapa con el usuario!!:', err)
    }
  }

  //TRAE LOS CORREOS DE LOS USUARIOS DE LA ETAPA
  async getCorreosEtapa({ DesarrolloProductoId, EtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProductoId', sql.Int, DesarrolloProductoId)
        .input('EtapaId', sql.Int, EtapaId)
      const resultado = await request.query(`
            SELECT DISTINCT U.CorreoEmpresa AS Correo, U.Nombres, U.Apellidos
            FROM GEN_USUARIOS U
              JOIN IND_GRUPOS_USUARIOS_ETAPAS GU ON GU.Usuario = U.Usuario
              JOIN IND_ETAPAS E ON E.EtapaId = GU.EtapaId
              JOIN IND_ETAPAS_ASIGNADAS A ON A.EtapaId = E.EtapaId
              JOIN IND_DESARROLLO_PRODUCTOS D ON D.DesarrolloProductoId = A.DesarrolloProducto
            WHERE D.DesarrolloProductoId = @DesarrolloProductoId AND A.EtapaId = @EtapaId`)
      console.log('Traendo los correos de los usuarios de la etapa')
      console.log('-------------------------')
      // console.log('CORREOS:', resultado?.recordset)
      return await resultado.recordset
    } catch (err) {
      console.error('Error al traer los correos de la etapa!!:', err)
    }
  }

  //TRAE LOS CORREOS SEGUN SU GRUPO (69 = GERENTE_ID)
  async getCorrreosGrupo({ CodigoGrupo }) {
    try {
      const pool = await poolPromise
      const request = pool.request().input('CodigoGrupo', sql.Int, CodigoGrupo)
      const resultado = await request.query(
        `SELECT CorreoEmpresa AS Correo FROM GEN_USUARIOS WHERE CodigoGrupo = @CodigoGrupo`
      )
      console.log('Traendo los correos del grupo:', CodigoGrupo)
      console.log('-------------------------')
      return await resultado.recordset
    } catch (err) {
      console.error('Error al traer los correos de la etapa!!:', err)
    }
  }

  //TRAER LAS ETAPAS SIGUIENTES
  async getEtapasSiguientes({ DesarrolloProductoId, EtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProductoId', sql.Int, DesarrolloProductoId)
        .input('EtapaId', sql.Int, EtapaId)
      const resultado = await request.query(`
            SELECT DISTINCT A.EtapasAsignadasId, A.DesarrolloProducto, A.EtapaId, A.Estado AS AsignacionEstado, A.Correlativo,
              D.Nombre AS NombreProducto, D.Estado AS ProductoEstado, D.Rechazos, D.Serie,
              E.Nombre AS NombreEtapa,
              U.Nombres, U.Apellidos, U.CodigoGrupo, U.CorreoEmpresa AS Correo,
	            PE.Estado AS ProgresoEstado, PE.Correlativo
            FROM IND_ETAPAS_ASIGNADAS A
              JOIN IND_DESARROLLO_PRODUCTOS D ON D.DesarrolloProductoId = A.DesarrolloProducto
              JOIN IND_ETAPAS E ON E.EtapaId = A.EtapaId
              JOIN GEN_USUARIOS U ON U.Usuario = D.Usuario
              JOIN IND_PROGRESO_ETAPAS PE ON PE.Etapa = E.EtapaId
            WHERE A.Correlativo IS NULL
              AND A.Estado IS NULL
              AND PE.Correlativo IS NULL
              AND A.DesarrolloProducto = @DesarrolloProductoId
              AND A.EtapaId >= @EtapaId
            ORDER BY A.EtapaId`)
      // console.log('Traendo las etapas siguientes')
      // console.log('-------------------------')
      return await resultado.recordset
    } catch (err) {
      console.error('Error al traer la etapa con el usuario!!:', err)
    }
  }
}
