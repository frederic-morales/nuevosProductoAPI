//--------------------------------------------------------
//CLASE PARA MANEJAR LAS CONSULTAS DE LAS ETAPAS
//--------------------------------------------------------
import { poolPromise } from './configDB.js'
import sql from 'mssql'

export class Etapas_sql {
  async getAll() {
    try {
      const pool = await poolPromise
      const result = await pool.request().query`SELECT * FROM IND_ETAPAS`
      console.log('Traendo todas las etapas')
      console.log('-------------------------')
      return result.recordset
    } catch (err) {
      console.error('Error al traer todas las Etapas!!:', err)
    }
  }

  //TRAE LA INFOMRACION DEL PROGRESO DE LA ETAPA
  async getProgresoInfo({ desarrolloProductoId, etapaId }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProducto', sql.Int, desarrolloProductoId)
        .input('EtapaId', sql.Int, etapaId)

      const resultado = await request.query(`
          SELECT E.EtapaId, E.Nombre, E.Descripcion, E.FechaCreacion, E.TiempoEstimado, 
          A.EtapasAsignadasId, A.DesarrolloProducto, A.Estado AS AsignacionEstado
            FROM IND_ETAPAS E
            JOIN IND_ETAPAS_ASIGNADAS A ON E.EtapaId = A.EtapaId
          WHERE A.DesarrolloProducto = @DesarrolloProducto AND A.EtapaId = @EtapaId`)
      console.log(resultado.recordset)
      return resultado.recordset
    } catch (err) {
      console.error('Error al traer las Etapas!!:', err)
    }
  }

  //TRAE TODAS LAS ETAPAS DEL PRODUCTO DADO
  async etapasPorProducto({ productoId }) {
    try {
      const pool = await poolPromise
      const request = pool.request()
      request.input('DesarrolloProducto', sql.Int, productoId)
      const resultado = await request.query(`
          SELECT A.DesarrolloProducto AS ProductoId, A.Estado, A.EtapasAsignadasId,
            E.EtapaId, E.Nombre, E.Descripcion, E.FechaCreacion, E.TiempoEstimado,
            P.ProgresoEtapaId, P.Usuario, P.FechaInicio, P.FechaFinal 
          FROM IND_ETAPAS E
            JOIN IND_ETAPAS_ASIGNADAS A ON A.EtapaId = E.EtapaId
            LEFT JOIN IND_PROGRESO_ETAPAS P ON P.Etapa = A.EtapaId
          WHERE A.DesarrolloProducto = @DesarrolloProducto
          ORDER BY EtapaId   
            `)
      console.log('Traendo todas las etapas del producto', productoId)
      console.log('-------------------------')
      return resultado.recordset
    } catch (err) {
      console.error('Error al traer las Etapas!!:', err)
    }
  }

  //TRAE TODA LA INFORMACION DE LA ETAPA SELECCIONADA
  async historial({ etapaAsignadaId, productoId }) {
    try {
      const pool = await poolPromise
      const request = pool.request()
      request.input('DesarrolloProducto', sql.Int, productoId)
      request.input('etapaAsignadaId', sql.Int, etapaAsignadaId)
      const resultado = await request.query(`
          SELECT A.DesarrolloProducto AS ProductoId, A.Estado, A.EtapasAsignadasId,
            E.EtapaId, E.Nombre, E.Descripcion, E.FechaCreacion, E.TiempoEstimado,
            P.ProgresoEtapaId, P.Usuario, P.FechaInicio, P.FechaFinal, 
            H.Estado, H.RutaDoc, H.Descripcion, H.FechaActualizacion
          FROM IND_ETAPAS E
            JOIN IND_ETAPAS_ASIGNADAS A ON A.EtapaId = E.EtapaId
            LEFT JOIN IND_PROGRESO_ETAPAS P ON P.Etapa = A.EtapaId
            LEFT JOIN IND_PROGRESO_ETAPAS_HISTORIAL H ON H.ProgresoEtapa = P.ProgresoEtapaId
          WHERE A.DesarrolloProducto = @DesarrolloProducto
          AND A.EtapasAsignadasId = @EtapaAsignadaId
        `)
      console.log('Traendo el historial de la etapa seleccionada', productoId)
      console.log('-------------------------')
      return resultado.recordset
    } catch (err) {
      console.error('Error al traer las Etapas!!:', err)
    }
  }

  //INSERTA UNA NUEVA ETAPA
  async insert({ nombre, descripcion = null, tiempoEstimado = null }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('Nombre', sql.VarChar(100), nombre)
        .input('Descripcion', sql.VarChar(255), descripcion)
        .input('TiempoEstimado', sql.Date, tiempoEstimado)

      const resultado = await request.query(`
          INSERT INTO IND_ETAPAS (Nombre, Descripcion, TiempoEstimado)
            OUTPUT INSERTED.EtapaId 
          VALUES (@Nombre, @Descripcion, @TiempoEstimado)
        `)
      // Retorna el Id generado en el nuevo registro insertado
      console.log('Insertando una nueva etapa')
      console.log('-------------------------')
      return resultado.recordset[0].EtapaId
    } catch (err) {
      console.error('Error al crear una nueva etapa!!:', err)
    }
  }

  //INSERTA EL USUARIO ASIGNADO A UNA ETAPA
  async asingarUsuario({ EtapaId, CodigoEmpleado }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('EtapaId', sql.Int, EtapaId)
        .input('CodigoEmpleado', sql.SmallInt, CodigoEmpleado)
      const resultado =
        await request.query(`INSERT INTO IND_GRUPOS_USUARIOS_ETAPAS
          console.log('Asignando usuarios a la etapa', EtapaId)
        (EtapaId, CodigoEmpleado) VALUES (@EtapaId, @CodigoEmpleado)`)
      console.log('-------------------------')
      return resultado.recordset
    } catch (err) {
      console.error('Error al crear una nueva etapa!!:', err)
    }
  }

  //TRAE TODOS LOS USUARIOS ASIGNADOS A ESA ETAPA
  async getUsuariosAsignados({ EtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool.request().input('EtapaId', sql.Int, EtapaId)
      const resultado =
        await request.query(`SELECT G.EtapaId, G.CodigoEmpleado, U.Usuario, U.Nombres, U.Apellidos
          FROM GEN_USUARIOS U JOIN IND_GRUPOS_USUARIOS_ETAPAS G ON G.CodigoEmpleado = U.CodigoEmpleado
        WHERE G.EtapaId = @EtapaId`)
      console.log('Traendo los usuarios asignados a la etapa: ', EtapaId)
      console.log('-------------------------')
      console.log(resultado.recordset)
      return resultado.recordset
    } catch (err) {
      console.error('Error al obtener los usuarios asignados!!:', err)
    }
  }

  //ELIMINA UN USUARIO ASIGNADO DE LA ETAPA
  async deleteUsuarioDeEtapa({ EtapaId, CodigoEmpleado }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('EtapaId', sql.Int, EtapaId)
        .input('CodigoEmpleado', sql.Int, CodigoEmpleado)

      const resultado = await request.query(`DELETE IND_GRUPOS_USUARIOS_ETAPAS
          WHERE EtapaId = @EtapaId AND CodigoEmpleado = @CodigoEmpleado`)

      console.log('Eliminando usuario de la etapa: ', EtapaId)
      console.log('-------------------------')
      return resultado.recordset
    } catch (err) {
      console.error('Error al crear una nueva etapa!!:', err)
    }
  }

  //INSERTA UN REGISTRO EN IND_PROGRESO_ETAPAS
  async iniciarEtapa({
    EtapaId,
    CodigoEmpleado,
    DesarrolloProductoId,
    Estado = 3,
    DescripcionEstado = 'Iniciado'
  }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('EtapaId', sql.Int, EtapaId)
        .input('CodigoEmpleado', sql.Int, CodigoEmpleado)
        .input('DesarrolloProductoId', sql.Int, DesarrolloProductoId)
        .input('Estado', sql.Int, Estado)
        .input('DescripcionEstado', sql.VarChar(100), DescripcionEstado)

      const resultado = await request.query(`
          INSERT INTO IND_PROGRESO_ETAPAS (Etapa, Usuario, DesarrolloProducto, Estado, DescripcionEstado)
	                VALUES (@EtapaId, @CodigoEmpleado, @DesarrolloProductoId, @Estado, @DescripcionEstado)`)

      console.log(
        `Iniciando etapa ${EtapaId} para el producto ${DesarrolloProductoId}`
      )
      console.log('-------------------------')

      return resultado
    } catch (err) {
      console.error('Error al crear una nueva etapa!!:', err)
    }
  }
}
