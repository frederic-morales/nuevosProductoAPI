//--------------------------------------------------------
//CLASE PARA MANEJAR LAS CONSULTAS DE LOS REPORTES
//--------------------------------------------------------
import { poolPromise } from './configDB.js'
import sql from 'mssql'

export class Reportes_Sql {
  //TRAE TODOS LOS PRODUCTOS POR USUARIO RESPONSABLE Y SERIE
  async getProductosPorUsuario(usuario) {
    try {
      const pool = await poolPromise
      const result = await pool
        .request()
        .input('usuario', sql.VarChar(20), usuario).query(`
          SELECT * FROM IND_DESARROLLO_PRODUCTOS 
	        WHERE Usuario = @usuario`)

      return result.recordset
    } catch (err) {
      console.error(
        'Error al traer los productos del usuario - REPORTES!!!:',
        err
      )
    }
  }

  //TRAE TODAS LAS ETAPAS POR PRODUCTO
  async getEtapasPorProducto(DesarrrolloProductoId) {
    try {
      const pool = await poolPromise
      const result = await pool
        .request()
        .input('DesarrrolloProductoId', sql.Int, DesarrrolloProductoId).query(`
           WITH EtapasActuales AS (
                -- Obtener las etapas con correlativo NULL (en progreso)
                SELECT 
                D.Nombre, D.Estado AS EstadoProducto, D.Rechazos, D.Serie,
                E.Nombre AS NombreEtapa, E.TiempoEstimado,
                    P.DesarrolloProducto, P.Etapa, P.Usuario, P.FechaInicio, P.FechaFinal, P.Estado, P.Correlativo
                FROM IND_PROGRESO_ETAPAS P
                JOIN IND_DESARROLLO_PRODUCTOS D ON D.DesarrolloProductoId = P.DesarrolloProducto
                RIGHT JOIN IND_ETAPAS E ON E.EtapaId = P.Etapa
                WHERE Correlativo IS NULL
              AND DesarrolloProducto = @DesarrrolloProductoId
            ),
            ProductosConEtapaActual AS (
                -- Identificar productos que tienen al menos una etapa con correlativo NULL
                SELECT DISTINCT DesarrolloProducto
                FROM EtapasActuales
            ),
            EtapasHistoricas AS (
                -- Obtener etapas históricas SOLO para productos que NO tienen etapas actuales (NULL)
                SELECT 
                    i2.Nombre, i2.EstadoProducto, i2.Rechazos, i2.Serie,
                i2.NombreEtapa, i2.TiempoEstimado,
                i1.DesarrolloProducto, i1.Etapa, i1.Usuario, i1.FechaInicio, i1.FechaFinal, i1.Estado, i1.Correlativo
                FROM IND_PROGRESO_ETAPAS i1
                INNER JOIN (
                    SELECT D.Nombre, D.Estado AS EstadoProducto, D.Rechazos, D.Serie,
                  P.DesarrolloProducto, P.Etapa, MAX(P.Correlativo) AS MaxCorrelativo,
                  E.Nombre AS NombreEtapa, E.TiempoEstimado
                    FROM IND_PROGRESO_ETAPAS P
                  JOIN IND_DESARROLLO_PRODUCTOS D ON D.DesarrolloProductoId = P.DesarrolloProducto
                  RIGHT JOIN IND_ETAPAS E ON E.EtapaId = P.Etapa
                    WHERE Correlativo IS NOT NULL
                    AND DesarrolloProducto NOT IN (SELECT DesarrolloProducto FROM ProductosConEtapaActual)
                AND D.Rechazos = P.Correlativo ------------------------
                AND DesarrolloProducto = @DesarrrolloProductoId
                    GROUP BY P.DesarrolloProducto, P.Etapa, D.Nombre, D.Estado, D.Rechazos, E.Nombre, E.TiempoEstimado,D.Serie
                ) i2 ON i1.DesarrolloProducto = i2.DesarrolloProducto 
                    AND i1.Etapa = i2.Etapa
                    AND i1.Correlativo = i2.MaxCorrelativo
            )
            -- Combinar resultados
            SELECT * FROM EtapasActuales
            UNION ALL
            SELECT * FROM EtapasHistoricas
            ORDER BY DesarrolloProducto, Etapa;
          `)

      return result.recordset
    } catch (err) {
      console.error('Error al traer el avance del producto - REPORTES!!:', err)
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
