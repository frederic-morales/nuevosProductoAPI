//--------------------------------------------------------
//CLASE PARA MANEJAR LAS CONSULTAS DE LAS ETAPAS
//--------------------------------------------------------
import { poolPromise } from './configDB.js'
import sql from 'mssql'
//-------------------------
//  SELECTS
//-------------------------
//TRAE TODAS LAS ETAPAS
export class Etapas_sql {
  async getInfo({ EtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool.request().input('EtapaId', sql.Int, EtapaId)
      const resultado = await request.query(
        `SELECT * FROM IND_ETAPAS WHERE EtapaId = @EtapaId`
      )
      console.log('Traendo la etapa seleccionada')
      console.log('-------------------------')
      // console.log(resultado.recordset)
      return resultado.recordset[0]
    } catch (err) {
      console.error('Error al traer la etapa con el usuario!!:', err)
    }
  }
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
          SELECT DP.DesarrolloProductoId, DP.Nombre AS NombreProducto, DP.Rechazos, 
            E.EtapaId, E.Nombre AS NombreEtapa, E.Descripcion, E.FechaCreacion, E.TiempoEstimado, 
            A.EtapasAsignadasId, A.Estado AS AsignacionEstado, A.Correlativo AS AsigCorrelativo,
            P.ProgresoEtapaId, P.Usuario, P.FechaInicio, P.FechaFinal, P.Estado AS ProgresoEstado, P.DescripcionEstado,  P.Correlativo as ProgCorrelativo
          FROM IND_ETAPAS E
            JOIN IND_ETAPAS_ASIGNADAS A ON E.EtapaId = A.EtapaId
            JOIN IND_DESARROLLO_PRODUCTOS DP ON DP.DesarrolloProductoId = A.DesarrolloProducto 
            LEFT JOIN IND_PROGRESO_ETAPAS P ON A.EtapaId = P.Etapa AND P.DesarrolloProducto = A.DesarrolloProducto
          WHERE A.DesarrolloProducto = @DesarrolloProducto AND A.EtapaId = @EtapaId AND A.Correlativo IS NULL 
          `)
      // console.log(resultado.recordset)
      return resultado.recordset[0]
    } catch (err) {
      console.error('Error al traer las Etapas!!:', err)
    }
  }

  //NUEVA
  //OBTIENE EL PROGRESO SELECCIONADO POR EL ID DE LA ETAPA ASIGNADA
  async getProgresoSeleccionado({
    DesarrolloProductoId,
    EtapaId,
    EtapasAsignadasId
  }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProductoId', sql.Int, DesarrolloProductoId)
        .input('EtapaId', sql.Int, EtapaId)
        .input('EtapasAsignadasId', sql.Int, EtapasAsignadasId)

      const resultado = await request.query(`
          SELECT DP.DesarrolloProductoId, DP.Nombre AS NombreProducto, DP.Rechazos, 
          E.EtapaId, E.Nombre AS NombreEtapa, E.Descripcion, E.FechaCreacion, E.TiempoEstimado, 
            A.EtapasAsignadasId, A.Estado AS AsignacionEstado, A.Correlativo AS AsigCorrelativo,
            P.ProgresoEtapaId, P.Usuario, P.FechaInicio, P.FechaFinal, P.Estado AS ProgresoEstado, P.DescripcionEstado,  P.Correlativo as ProgCorrelativo 
          FROM IND_PROGRESO_ETAPAS P
            JOIN IND_ETAPAS E ON E.EtapaId = P.Etapa
            JOIN IND_ETAPAS_ASIGNADAS A ON A.EtapaId = P.Etapa AND A.DesarrolloProducto = P.DesarrolloProducto
            JOIN IND_DESARROLLO_PRODUCTOS DP ON DP.DesarrolloProductoId = P.DesarrolloProducto  
          WHERE P.DesarrolloProducto = @DesarrolloProductoId AND P.Etapa = @EtapaId AND A.EtapasAsignadasId = @EtapasAsignadasId AND P.Correlativo IS NULL
        `)

      return await resultado.recordset[0]
    } catch (err) {
      console.error('Error al traer las Etapas 2!!:', err)
    }
  }

  //TRAE TODAS LAS ETAPAS ASIGNADAS DEL PRODUCTO SELECCIONADO Y CORRELATIVO ES NULL--
  async getEtapasAsignadas({ ProductoId }) {
    try {
      const pool = await poolPromise
      const request = pool.request()
      request.input('DesarrolloProducto', sql.Int, ProductoId)
      const resultado = await request.query(`
                SELECT A.DesarrolloProducto AS ProductoId, A.Estado AS AsignacionEstado, A.EtapasAsignadasId, A.Correlativo,
                  E.EtapaId, E.Nombre, E.Descripcion, E.TiempoEstimado
                FROM IND_ETAPAS E
                  JOIN IND_ETAPAS_ASIGNADAS A ON A.EtapaId = E.EtapaId
                WHERE A.DesarrolloProducto = @DesarrolloProducto AND A.Correlativo IS NULL
                ORDER BY EtapaId`)
      // console.log('Trae las etapas asignadas al producto', ProductoId)
      // console.log('-------------------------')
      return resultado.recordset
    } catch (err) {
      console.error('Error al traer las Etapas Asignadas!!:', err)
    }
  }

  //TRAE EL PROGRESO DE LA ETAPA SI EXISTE Y CORRELATIVO ES NULL
  async getProgresoEtapa({ productoId, EtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool.request()
      request.input('DesarrolloProducto', sql.Int, productoId)
      request.input('EtapaId', sql.Int, EtapaId)
      const resultado = await request.query(`
                SELECT * FROM IND_PROGRESO_ETAPAS 
                WHERE DesarrolloProducto = @DesarrolloProducto 
                AND Etapa = @EtapaId
                AND Correlativo IS NULL `)
      console.log('Trae la etapa en progreso', productoId)
      console.log('-------------------------')
      return resultado.recordset
    } catch (err) {
      console.error('Error al traer el progreso de la etapa!!:', err)
    }
  }

  ///NUEVA
  //TRAE TODAS LAS ETAPAS INICIADAS DEL PRODUCTO
  async getEtapasIniciadasAnteriores({ ProductoId }) {
    try {
      const pool = await poolPromise
      const request = pool.request()
      request.input('DesarrolloProducto', sql.Int, ProductoId)
      const resultado = await request.query(`
                SELECT * FROM IND_ETAPAS E
                  JOIN IND_PROGRESO_ETAPAS P ON E.EtapaId = P.Etapa
                WHERE P.DesarrolloProducto = @DesarrolloProducto
                ORDER BY EtapaId`)
      console.log(
        'Trae las etapas iniciadas anteriormente al producto',
        ProductoId
      )
      console.log('-------------------------')
      return resultado.recordset
    } catch (err) {
      console.error('Error al traer las Etapas Iniciada!!:', err)
    }
  }

  //NUEVA
  //TRAE LAS ETAPAS INICIADAS EN EL PROCESO ACTUAL
  // async getEtapasIniciadasEnProcesoActual({ ProductoId }) {
  //   try {
  //     const pool = await poolPromise
  //     const request = pool.request()
  //     request.input('DesarrolloProducto', sql.Int, ProductoId)
  //     const resultado = await request.query(`
  //               SELECT * FROM IND_ETAPAS E
  //                 JOIN IND_PROGRESO_ETAPAS P ON E.EtapaId = P.Etapa
  //               WHERE P.DesarrolloProducto = @DesarrolloProducto AND P.Correlativo IS NULL
  //               ORDER BY EtapaId`)
  //     console.log('Trae las etapas iniciadas en el proceso actual', ProductoId)
  //     console.log('-------------------------')
  //     return resultado.recordset
  //   } catch (err) {
  //     console.error('Error al traer iniciadas en el proceso actual!!:', err)
  //   }
  // }

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
      // console.log('Traendo los usuarios asignados a la etapa: ', EtapaId)
      // console.log('-------------------------')
      // console.log(resultado.recordset)
      return resultado.recordset
    } catch (err) {
      console.error('Error al obtener los usuarios asignados!!:', err)
    }
  }

  // TRAE EL HISTORIAL DE LA ETAPA EN PROGRESO
  async getProgresoHistorial({
    DesarrolloProductoId,
    EtapaId,
    ProgresoEtapaId
  }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProducto', sql.Int, DesarrolloProductoId)
        .input('EtapaId', sql.Int, EtapaId)
        .input('ProgresoEtapaId', sql.Int, ProgresoEtapaId)

      const resultado = await request.query(`
          SELECT H.ProEtapaHistorialId, P.ProgresoEtapaId, P.DesarrolloProducto AS Producto, P.Etapa, P.FechaInicio, P.Estado AS ProgresoEstado,
	          H.ProEtapaHistorialId AS HistorialId, H.Estado AS ActualizacionEstado, H.RutaDoc, H.Descripcion, H.FechaActualizacion, H.Usuario
          FROM IND_PROGRESO_ETAPAS P
            JOIN IND_PROGRESO_ETAPAS_HISTORIAL H ON H.ProgresoEtapa = P.ProgresoEtapaId
          WHERE P.DesarrolloProducto = @DesarrolloProducto AND P.Etapa = @EtapaId AND ProgresoEtapaId = @ProgresoEtapaId
        `)
      console.log('Traendo el Historial de la etapa ', EtapaId)
      console.log('-------------------------')
      // console.log(resultado.recordset)
      return resultado.recordset
    } catch (err) {
      console.error('Error al obtener el Historial de la etapa!!:', err)
    }
  }

  // TRAE LOS PROCESOS RESPONSABLES DE CADA ETAPA
  async getProcesosResponsables({ EtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool.request().input('EtapaId', sql.Int, EtapaId)
      const resultado = await request.query(`
        SELECT E.EtapaId, 
          R.CodigoProceso, P.Nombre, P.Abreviatura, P.TipoProceso, P.CodigoResponsable, P.UsuarioDuenoProceso, P.CorreoDuenoProceso
        FROM IND_ETAPAS E
          JOIN IND_PROCESOS_RESPONSABLES R ON E.EtapaId = R.Etapa
          JOIN GES_PROCESOS P ON P.CodigoProceso = R.CodigoProceso
        WHERE E.EtapaId = @EtapaId
        ORDER BY E.EtapaId`)

      // console.log('Traendo los procesos de la etapa ', EtapaId)
      // console.log('-------------------------')
      // console.log(resultado.recordset)
      return resultado.recordset
    } catch (err) {
      console.error('Error al obtener el Historial de la etapa!!:', err)
    }
  }

  //VERIFICA SI LAS DEPENDENCIAS DE UNA ETAPA ESTAN COMPLETAS
  async verificarDependencias({ DesarrolloProductoId, EtapaId }) {
    try {
      const pool = await poolPromise
      const request = await pool
        .request()
        .input('DesarrolloProductoId', sql.Int, DesarrolloProductoId)
        .input('EtapaId', sql.Int, EtapaId)

      // const result = await request.execute('SP_VERIFICAR_DEPENDENCIAS_ETAPA_V3') // DB_ANTERIOR
      const result = await request.execute('SP_VERIFICAR_DEPENDENCIAS_ETAPA')
      // console.log(result)
      return result.returnValue
    } catch (err) {
      console.error('Error al traer la etapa con el usuario!!:', err)
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
        .input('TiempoEstimado', sql.Date, tiempoEstimado)
        .input('Descripcion', sql.VarChar(255), descripcion)

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
    Usuario,
    DesarrolloProductoId,
    Estado,
    DescripcionEstado
  }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('EtapaId', sql.Int, EtapaId)
        .input('Usuario', sql.VarChar(20), Usuario)
        .input('DesarrolloProductoId', sql.Int, DesarrolloProductoId)
        .input('Estado', sql.Int, Estado)
        .input('DescripcionEstado', sql.VarChar(100), DescripcionEstado)

      const resultado = await request.query(`
          INSERT INTO IND_PROGRESO_ETAPAS (Etapa, Usuario, DesarrolloProducto, Estado, DescripcionEstado)
	                VALUES (@EtapaId, @Usuario, @DesarrolloProductoId, @Estado, @DescripcionEstado)`)

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
    Descripcion = null,
    Usuario
  }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('ProgresoEtapaId', sql.Int, ProgresoEtapaId)
        .input('Estado', sql.Int, Estado)
        .input('RutaDoc', sql.VarChar(250), RutaDoc)
        .input('Descripcion', sql.VarChar(500), Descripcion)
        .input('Usuario', sql.VarChar(20), Usuario)

      const resultado = await request.query(`
          INSERT INTO IND_PROGRESO_ETAPAS_HISTORIAL (ProgresoEtapa, Estado, RutaDoc, Descripcion, Usuario)
	            VALUES (@ProgresoEtapaId, @Estado, @RutaDoc, @Descripcion, @Usuario)`)

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
    Estado = 3,
    DesarrolloProductoId,
    EtapaId
  }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProductoId', sql.Int, DesarrolloProductoId)
        .input('EtapaId', sql.Int, EtapaId)
        .input('Estado', sql.Int, Estado)

      const resultado = await request.query(`
          UPDATE IND_ETAPAS_ASIGNADAS 
            SET Estado = @Estado
          WHERE DesarrolloProducto = @DesarrolloProductoId AND EtapaId = @EtapaId
          AND Correlativo IS NULL
        `)
      console.log(`Actualizando el estado de la etapa asignada`)
      console.log('-------------------------')
      return resultado
    } catch (err) {
      console.error('Actualizando el estado de la etapa asignada!!:', err)
    }
  }

  //Actualizar Correlativo de la etapa asignada
  async actualizarCorrelativo({ Correlativo, EtapasAsignadasId }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('EtapasAsignadasId', sql.Int, EtapasAsignadasId)
        .input('Correlativo', sql.Int, Correlativo)

      const resultado = await request.query(`
          UPDATE IND_ETAPAS_ASIGNADAS 
            SET Correlativo = @Correlativo
          WHERE EtapasAsignadasId = @EtapasAsignadasId
        `)
      console.log(`Actualizando el estado de la etapa asignada`)
      console.log('-------------------------')
      return await resultado
    } catch (err) {
      console.error('Actualizando el estado de la etapa asignada!!:', err)
    }
  }

  //Actualiza el progreso de la etapa en IND_PROGRESO_ETAPAS
  async actualizarProgresoEtapa({
    Estado,
    FechaFinal = new Date(),
    ProgresoEtapaId,
    EstadoDescripcion,
    Correlativo
  }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('FechaFinal', sql.Date, FechaFinal)
        .input('ProgresoEtapaId', sql.Int, ProgresoEtapaId)
        .input('Estado', sql.Int, Estado)
        .input('EstadoDescripcion', sql.VarChar(100), EstadoDescripcion)
        .input('Correlativo', sql.Int, Correlativo)

      const resultado = await request.query(`
        UPDATE IND_PROGRESO_ETAPAS
          SET Estado = @Estado, FechaFinal = @FechaFinal, DescripcionEstado = @EstadoDescripcion, Correlativo = @Correlativo
        WHERE ProgresoEtapaId = @ProgresoEtapaId
        `)
      // console.log(Estado)
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

  // ELIMINA UN REGISTRO DE ACTUALIZACION DE LA ETAPA
  async deleteEtapaHistorial({ ProEtapaHistorialId }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('ProEtapaHistorialId', sql.Int, ProEtapaHistorialId)

      const resultado = await request.query(
        `DELETE IND_PROGRESO_ETAPAS_HISTORIAL WHERE ProEtapaHistorialId = @ProEtapaHistorialId`
      )

      console.log('Eliminando el historial de la etapa: ', ProEtapaHistorialId)
      console.log('-------------------------')
      return resultado.recordset
    } catch (err) {
      console.error('Error al eliminar un usuario de la etapa!!:', err)
    }
  }

  // ELIMINA UN REGISTRO DE PROGRESO DE UNA ETAPA
  async deleteProgresoEtapa({ ProgresoEtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('ProgresoEtapaId', sql.Int, ProgresoEtapaId)

      const resultado = await request.query(`
          SELECT DELETE IND_PROGRESO_ETAPAS WHERE ProgresoEtapaId = @ProgresoEtapaId
        `)

      console.log('Eliminando el Progreso de la Etapa: ', ProgresoEtapaId)
      console.log('-------------------------')

      return resultado.recordset
    } catch (err) {
      console.error('Error al eliminar un usuario de la etapa!!:', err)
    }
  }
}
