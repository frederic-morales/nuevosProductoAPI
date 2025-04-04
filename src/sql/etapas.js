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
            A.EtapasAsignadasId, A.Estado AS AsignacionEstado,
            P.ProgresoEtapaId, P.Usuario, P.FechaInicio, P.FechaFinal, P.Estado AS ProgresoEstado, P.DescripcionEstado
          FROM IND_ETAPAS E
            JOIN IND_ETAPAS_ASIGNADAS A ON E.EtapaId = A.EtapaId
            JOIN IND_DESARROLLO_PRODUCTOS DP ON DP.DesarrolloProductoId = A.DesarrolloProducto 
            LEFT JOIN IND_PROGRESO_ETAPAS P ON A.EtapaId = P.Etapa AND P.DesarrolloProducto = A.DesarrolloProducto
          WHERE A.DesarrolloProducto = @DesarrolloProducto AND A.EtapaId = @EtapaId
          `)
      // console.log(resultado.recordset)
      return resultado.recordset[0]
    } catch (err) {
      console.error('Error al traer las Etapas!!:', err)
    }
  }

  //TRAE TODAS LAS ETAPAS DEL PRODUCTO SELECCIONADO
  async etapasPorProducto({ DesarrolloProductoId }) {
    try {
      const pool = await poolPromise
      const request = pool.request()
      request.input('DesarrolloProducto', sql.Int, DesarrolloProductoId)
      const resultado =
        await request.query(`SELECT A.DesarrolloProducto AS ProductoId, A.Estado AS ProductoEstado, A.EtapasAsignadasId,
            E.EtapaId, E.Nombre, E.Descripcion, E.FechaCreacion, E.TiempoEstimado,
            P.ProgresoEtapaId, P.Usuario, P.FechaInicio, P.FechaFinal, P.Estado AS ProgresoEstado
            FROM IND_ETAPAS E
            JOIN IND_ETAPAS_ASIGNADAS A ON A.EtapaId = E.EtapaId
            LEFT JOIN IND_PROGRESO_ETAPAS P ON P.Etapa = A.EtapaId AND P.DesarrolloProducto = A.DesarrolloProducto
          WHERE A.DesarrolloProducto = @DesarrolloProducto
          ORDER BY EtapaId`)
      console.log('Traendo todas las etapas del producto', DesarrolloProductoId)
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
      // console.log(resultado.recordset)
      return resultado.recordset
    } catch (err) {
      console.error('Error al obtener los usuarios asignados!!:', err)
    }
  }

  // TRAE EL HISTORIAL DE LA ETAPA EN PROGRESO
  async getProgresoHistorial({ DesarrolloProductoId, EtapaId }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProducto', sql.Int, DesarrolloProductoId)
        .input('EtapaId', sql.Int, EtapaId)

      const resultado = await request.query(`
          SELECT H.ProEtapaHistorialId, P.ProgresoEtapaId, P.DesarrolloProducto AS Producto, P.Etapa, P.FechaInicio, P.Estado AS ProgresoEstado,
	          H.ProEtapaHistorialId AS HistorialId, H.Estado AS ActualizacionEstado, H.RutaDoc, H.Descripcion, H.FechaActualizacion
          FROM IND_PROGRESO_ETAPAS P
            JOIN IND_PROGRESO_ETAPAS_HISTORIAL H ON H.ProgresoEtapa = P.ProgresoEtapaId
          WHERE P.DesarrolloProducto = @DesarrolloProducto AND P.Etapa = @EtapaId
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

      console.log('Traendo los procesos de la etapa ', EtapaId)
      console.log('-------------------------')
      // console.log(resultado.recordset)
      return resultado.recordset
    } catch (err) {
      console.error('Error al obtener el Historial de la etapa!!:', err)
    }
  }

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

  //VERIFICA SI LAS DEPENDENCIAS DE UNA ETAPA ESTAN COMPLETAS
  async verificarDependencias({ DesarrolloProductoId, EtapaId }) {
    try {
      const pool = await poolPromise
      const request = await pool
        .request()
        .input('DesarrolloProductoId', sql.Int, DesarrolloProductoId)
        .input('EtapaId', sql.Int, EtapaId)

      const result = await request.execute('SP_VERIFICAR_DEPENDENCIAS_ETAPA_V2')
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
          (EtapaId, Usuario) VALUES   (@EtapaId, @Usuario)`)

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
    Estado = 3,
    DescripcionEstado = 'Iniciado'
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
            SET Estado = @Estado -- 3 = INICIADO
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
  async actualizarProgresoEtapa({
    Estado,
    FechaFinal = new Date(),
    ProgresoEtapaId,
    EstadoDescripcion
  }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('FechaFinal', sql.Date, FechaFinal)
        .input('ProgresoEtapaId', sql.Int, ProgresoEtapaId)
        .input('Estado', sql.Int, Estado)
        .input('EstadoDescripcion', sql.VarChar(100), EstadoDescripcion)

      const resultado = await request.query(`
        UPDATE IND_PROGRESO_ETAPAS
          SET Estado = @Estado, FechaFinal = @FechaFinal, DescripcionEstado = @EstadoDescripcion
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

  async deleteEtapaHistorial({ ProEtapaHistorialId }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('ProEtapaHistorialId', sql.Int, ProEtapaHistorialId)

      const resultado = await request.query(`
        DELETE IND_PROGRESO_ETAPAS_HISTORIAL WHERE ProEtapaHistorialId = @ProEtapaHistorialId
      `)

      console.log('Eliminando el historial de la etapa: ', ProEtapaHistorialId)
      console.log('-------------------------')
      return resultado.recordset
    } catch (err) {
      console.error('Error al eliminar un usuario de la etapa!!:', err)
    }
  }
}
