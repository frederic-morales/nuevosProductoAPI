import { poolPromise } from './configDB.js'
import sql from 'mssql'

export class Notificaciones_sql {
  //TRAE LA INFORMACION DE LA ETAPA Y EL USUARIO PARA ENVIAR LA NOTIFICAICION POR MAIL
  async getEtapaUsuario({ DesarrolloProductoId, EtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProductoId', sql.Int, DesarrolloProductoId)
        .input('EtapaId', sql.Int, EtapaId)
      const resultado = await request.query(`
              SELECT P.ProgresoEtapaId, P.Estado AS ProgresoEstado, P.FechaInicio,
                D.DesarrolloProductoId, D.Nombre AS NombreProducto,  D.Serie,
                E.Nombre AS NombreEtapa, E.EtapaId, E.TiempoEstimado,
                U.Nombres, U.Apellidos, U.CorreoEmpresa AS Correo
              FROM IND_PROGRESO_ETAPAS P
                JOIN IND_DESARROLLO_PRODUCTOS D ON P.DesarrolloProducto = D.DesarrolloProductoId
                JOIN IND_ETAPAS E ON E.EtapaId = P.Etapa
                JOIN GEN_USUARIOS U ON U.Usuario = P.Usuario
                WHERE P.DesarrolloProducto = @DesarrolloProductoId AND E.EtapaId = @EtapaId`)

      console.log('Traendo la informacion de la etapa con el usuario')
      console.log('-------------------------')
      return await resultado?.recordset[0]
    } catch (err) {
      console.error('Error al traer la etapa con el usuario!!:', err)
    }
  }

  async getEtapasSiguientes({ DesarrolloProductoId, EtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProductoId', sql.Int, DesarrolloProductoId)
        .input('EtapaId', sql.Int, EtapaId)
      const resultado = await request.query(`
            SELECT 
                A.EtapasAsignadasId, A.DesarrolloProducto, A.EtapaId, A.Estado AS AsignacionEstado, A.Correlativo,
                D.Nombre AS NombreProducto, D.Estado AS ProductoEstado, D.Rechazos, D.Serie,
                E.Nombre AS NombreEtapa,
                GU.Usuario,
                U.Nombres, U.Apellidos, U.CodigoGrupo, U.CorreoEmpresa AS Correo
            FROM IND_ETAPAS_ASIGNADAS A
                JOIN IND_DESARROLLO_PRODUCTOS D ON D.DesarrolloProductoId = A.DesarrolloProducto
                JOIN IND_ETAPAS E ON E.EtapaId = A.EtapaId
                JOIN IND_GRUPOS_USUARIOS_ETAPAS GU ON GU.EtapaId = E.EtapaId
                JOIN GEN_USUARIOS U ON U.Usuario = GU.Usuario
            WHERE A.Correlativo IS NULL
                AND A.Estado IS NULL
                AND A.DesarrolloProducto = @DesarrolloProductoId
                AND A.EtapaId >= @EtapaId
            ORDER BY A.EtapaId`)
      console.log('Traendo las etapas siguientes')
      console.log('-------------------------')
      return await resultado.recordset
    } catch (err) {
      console.error('Error al traer la etapa con el usuario!!:', err)
    }
  }
}
