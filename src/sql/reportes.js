//--------------------------------------------------------
//CLASE PARA MANEJAR LAS CONSULTAS DE LOS REPORTES
//--------------------------------------------------------
import { poolPromise } from './configDB.js'
import sql from 'mssql'

export class Reportes_Sql {
  //TRAE TODOS LOS PRODUCTOS POR USUARIO RESPONSABLE Y SERIE
  async getProductosPorUsuario(usuario, serie) {
    try {
      const pool = await poolPromise
      const result = await pool
        .request()
        .input('Usuario', sql.VarChar(20), usuario)
        .input('Serie', sql.Char(1), serie)
        .query(`SELECT * FROM IND_DESARROLLO_PRODUCTOS 
                WHERE Usuario = @Usuario
                AND Serie = @Serie`)

      return result.recordset
    } catch (err) {
      console.error('Error al traer los productos por usuario!!:', err)
    }
  }

  //TRAE LA INFORMACION DEL PRODUCTO
  async getProductoAvance(desarrolloProductoId) {
    try {
      const pool = await poolPromise
      const result = await pool
        .request()
        .input('desarrolloProductoId', sql.Int, desarrolloProductoId).query(`
          SELECT E.EtapaId, E.Nombre, E.FechaCreacion, E.TiempoEstimado,
            A.EtapasAsignadasId, A.DesarrolloProducto, A.Estado, A.Correlativo,
            P.ProgresoEtapaId, P.Usuario, P.FechaInicio, P.FechaFinal, P.DesarrolloProducto, P.Correlativo,
            H.FechaActualizacion AS UltimaActualizacion, H.Descripcion
          FROM IND_ETAPAS E
            JOIN IND_ETAPAS_ASIGNADAS A ON A.EtapaId = E.EtapaId
            LEFT JOIN IND_PROGRESO_ETAPAS P ON P.Etapa = E.EtapaId AND P.DesarrolloProducto = A.DesarrolloProducto
            OUTER APPLY (
            SELECT TOP 1 * 
              FROM IND_PROGRESO_ETAPAS_HISTORIAL H
              WHERE H.ProgresoEtapa = P.ProgresoEtapaId
              ORDER BY FechaActualizacion DESC
            ) H
          WHERE A.DesarrolloProducto = @desarrolloProductoId
            AND ((P.Correlativo IS NULL AND A.Correlativo IS NULL) OR (P.Correlativo = A.Correlativo))
            AND A.Correlativo IS NULL
          ORDER BY E.EtapaId`)

      return result.recordset
    } catch (err) {
      console.error('Error al traer los productos por usuario!!:', err)
    }
  }
}
