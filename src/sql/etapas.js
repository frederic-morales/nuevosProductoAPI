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

  //-------------------------
  //  SELECTS
  //-------------------------
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
            A.EtapasAsignadasId, A.DesarrolloProducto, A.Estado AS AsignacionEstado,
            P.ProgresoEtapaId, P.Usuario, P.FechaInicio, P.FechaFinal, P.Estado AS ProgresoEstado, P.DescripcionEstado
          FROM IND_ETAPAS E
            JOIN IND_ETAPAS_ASIGNADAS A ON E.EtapaId = A.EtapaId
            LEFT JOIN IND_PROGRESO_ETAPAS P ON A.EtapaId = P.Etapa AND P.DesarrolloProducto = A.DesarrolloProducto
          WHERE A.DesarrolloProducto = @DesarrolloProducto AND A.EtapaId = @EtapaId
          `)
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
            P.ProgresoEtapaId, P.Usuario, P.FechaInicio, P.FechaFinal, P.Estado AS ProgresoEstado
          FROM IND_ETAPAS E
            JOIN IND_ETAPAS_ASIGNADAS A ON A.EtapaId = E.EtapaId
            LEFT JOIN IND_PROGRESO_ETAPAS P ON P.Etapa = A.EtapaId AND P.DesarrolloProducto = A.DesarrolloProducto
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

  //TRAE TODOS LOS USUARIOS ASIGNADOS A ESA ETAPA
  async getUsuariosAsignados({ EtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool.request().input('EtapaId', sql.Int, EtapaId)
      const resultado =
        await request.query(`SELECT G.EtapaId, U.Usuario, U.Nombres, U.Apellidos
          FROM GEN_USUARIOS U JOIN IND_GRUPOS_USUARIOS_ETAPAS G ON G.Usuario = U.Usuario
        WHERE G.EtapaId = @EtapaId`)
      console.log('Traendo los usuarios asignados a la etapa: ', EtapaId)
      console.log('-------------------------')
      console.log(resultado.recordset)
      return resultado.recordset
    } catch (err) {
      console.error('Error al obtener los usuarios asignados!!:', err)
    }
  }

  // TRAE TODAS LAS ACTUALIZACIONES DEL PROGRESO DE UNA ETAPA
  async getProgresoHistorial({ DesarrolloProductoId, EtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProducto', sql.Int, DesarrolloProductoId)
        .input('EtapaId', sql.Int, EtapaId)

      const resultado = await request.query(`
          SELECT P.ProgresoEtapaId, P.DesarrolloProducto AS Producto, P.Etapa, P.FechaInicio, P.Estado AS ProgresoEstado,
	          H.ProEtapaHistorialId AS HistorialId, H.Estado AS ActualizacionEstado, H.RutaDoc, H.Descripcion, H.FechaActualizacion
          FROM IND_PROGRESO_ETAPAS P
            JOIN IND_PROGRESO_ETAPAS_HISTORIAL H ON H.ProgresoEtapa = P.ProgresoEtapaId
          WHERE P.DesarrolloProducto = @DesarrolloProducto AND P.Etapa = @EtapaId
        `)

      console.log('Traendo el Historial de la etapa ', EtapaId)
      console.log('-------------------------')
      console.log(resultado.recordset)
      return resultado.recordset
    } catch (err) {
      console.error('Error al obtener el Historial de la etapa!!:', err)
    }
  }

  //-------------------------
  //  INSERTS
  //-------------------------
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
  async asingarUsuario({ EtapaId, Usuario }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('EtapaId', sql.Int, EtapaId)
        .input('Usuario', sql.VarChar(20), Usuario)
      const resultado =
        await request.query(`INSERT INTO IND_GRUPOS_USUARIOS_ETAPAS
          (EtapaId, Usuario) VALUES (@EtapaId, @Usuario)`)

      console.log('-------------------------')
      console.log('Asignando usuarios a la etapa', EtapaId)
      return resultado.recordset
    } catch (err) {
      console.error('Error al agregar un usuario a la etapa!!:', err)
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
      console.error('Error al iniciar una etapa!!:', err)
    }
  }

  //INSERTA UN REGISTRO EN IND_PROGRESO_ETAPAS_HISTORIAL
  async agregarActualizacion({
    ProgresoEtapaId,
    Estado,
    RutaDoc = null,
    Descripcion = null
  }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('ProgresoEtapaId', sql.Int, ProgresoEtapaId)
        .input('Estado', sql.Int, Estado)
        .input('RutaDoc', sql.VarChar(250), RutaDoc)
        .input('Descripcion', sql.VarChar(500), Descripcion)

      const resultado = await request.query(`
          INSERT INTO IND_PROGRESO_ETAPAS_HISTORIAL (ProgresoEtapa, Estado, RutaDoc, Descripcion)
	            VALUES (@ProgresoEtapaId, @Estado, @RutaDoc, @Descripcion)`)

      console.log(`Agregando actualizacion para etapa ${ProgresoEtapaId}`)
      console.log('-------------------------')
      console.log(resultado)
      return resultado
    } catch (err) {
      console.error('Error al crear una actualizacion de etapa!!:', err)
    }
  }

  //-------------------------
  //  UPDATES
  //-------------------------
  //Actualiza el estado de la etapa asignada en IND_ETAPAS_ASIGNADAS
  async actualizarEstadoAsignacion({
    DesarrolloProductoId,
    EtapaId,
    Estado = 3
  }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProducto', sql.Int, DesarrolloProductoId)
        .input('EtapaId', sql.Int, EtapaId)
        .input('Estado', sql.Int, Estado)

      const resultado = await request.query(`
          UPDATE IND_ETAPAS_ASIGNADAS 
            SET Estado = @Estado --INICIADO
          WHERE DesarrolloProducto = @DesarrolloProducto AND EtapaId = @EtapaId
        `)
      console.log(
        `Actualizando ${EtapaId} para el producto ${DesarrolloProductoId} en etapas asignadas`
      )
      console.log('-------------------------')
      return resultado
    } catch (err) {
      console.error('Error al actualizar estado!!:', err)
    }
  }

  //Actualiza el progreso de la etapa en IND_PROGRESO_ETAPAS
  async actualizarProgresoEtapa({ Estado, FechaFinal, ProgresoEtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('Estado', sql.Int, Estado)
        .input('FechaFinal', sql.Date, FechaFinal)
        .input('ProgresoEtapaId', sql.Int, ProgresoEtapaId)

      const resultado = await request.query(`
        UPDATE IND_PROGRESO_ETAPAS
          SET Estado = @Estado, FechaFinal = @FechaFinal
        WHERE ProgresoEtapaId = @ProgresoEtapaId
        `)
      console.log(Estado)
      console.log(`Actualizando el progreso de la etapa ${ProgresoEtapaId}`)
      console.log('-------------------------')
      console.log(await resultado)
      return await resultado
    } catch (err) {
      console.error('Error al actualizar estado!!:', err)
    }
  }

  //-------------------------
  //  DELETES
  //-------------------------
  //ELIMINA UN USUARIO ASIGNADO DE LA ETAPA
  async deleteUsuarioDeEtapa({ EtapaId, Usuario }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('EtapaId', sql.Int, EtapaId)
        .input('Usuario', sql.VarChar(20), Usuario)

      const resultado = await request.query(`DELETE IND_GRUPOS_USUARIOS_ETAPAS
          WHERE EtapaId = @EtapaId AND Usuario = @Usuario`)

      console.log('Eliminando usuario de la etapa: ', EtapaId)
      console.log('-------------------------')
      return resultado.recordset
    } catch (err) {
      console.error('Error al eliminar un usuario de la etapa!!:', err)
    }
  }
}
