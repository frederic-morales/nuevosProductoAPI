//--------------------------------------------------------
//CLASE PARA MANEJAR LAS CONSULTAS DE LOS NUEVOS PRODUCTOS
//--------------------------------------------------------
// import { sqlConfig } from './configDB.js'
// import sql from 'mssql'

import { poolPromise } from './configDB.js'
import sql from 'mssql'

export class NuevoProducto {
  //-------------------------
  //  SELECTS
  //-------------------------
  async getAll() {
    try {
      const pool = await poolPromise
      const result = await pool.request()
        .query`SELECT * FROM IND_DESARROLLO_PRODUCTOS`
      return result.recordset
    } catch (err) {
      console.error('Error al traer los Productos!!:', err)
    }
  }

  //TRAE TODOS LOS PRODUCTOS DE LA SERIE ELEGIDA
  async getProductosPorSerie(serie) {
    try {
      const pool = await poolPromise
      const request = await pool.request().input('Serie', sql.Char(1), serie)
      const resultado =
        await request.query(`SELECT P.DesarrolloProductoId, P.Nombre, P.Descripcion, P.Estado, P.Rechazos, 
                            P.FechaInicio, P.FechaFin, P.TiempoEstimado, P.TiempoTotal, P.Serie, P.Usuario,
                            U.CodigoGrupo, U.Nombres AS Responsable, U.Apellidos, U.CorreoEmpresa
                              FROM IND_DESARROLLO_PRODUCTOS P
                              JOIN GEN_USUARIOS U ON U.Usuario = P.Usuario
                            WHERE Serie = @Serie`)

      console.log(`Traendo los productos de la serie ${serie}`)
      return resultado.recordset
    } catch (err) {
      console.error('Error al traer los Productos!!:', err)
    }
  }

  //TRAE LA INFORMACION DEL PRODUCTO
  async getInfo({ productoId }) {
    try {
      const pool = await poolPromise
      const request = pool.request().input('ProductoId', sql.Int, productoId)
      console.log(productoId)

      const resultado = await request.query(`
        SELECT P.DesarrolloProductoId, P.Nombre, P.Descripcion, P.Estado, P.Rechazos, P.FechaInicio, 
        P.FechaFin, P.TiempoEstimado, P.TiempoTotal, P.Serie, U.Nombres, U.Apellidos, P.Usuario
        FROM IND_DESARROLLO_PRODUCTOS P 
          LEFT JOIN GEN_USUARIOS U ON P.Usuario = U.Usuario
        WHERE P.DesarrolloProductoId = @ProductoId
          `)
      return resultado.recordset
    } catch (err) {
      console.error('Error al traer la info del producto...', err)
    }
  }

  // TRAE LAS COLUMNAS DE LA TABLA DE IND_DESARROLLOS_PRODUCTOS
  async getColumnas() {
    try {
      const pool = await poolPromise
      const resultado = await pool.request().query(`
          SELECT ORDINAL_POSITION, COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'IND_DESARROLLO_PRODUCTOS'
      `)
      const columns = resultado.recordset.map((row) => ({
        ordinalPosition: row.ORDINAL_POSITION,
        columnName: row.COLUMN_NAME,
        dataType: row.DATA_TYPE,
        isNullable: row.IS_NULLABLE === 'YES'
      }))
      // console.log(columns)
      console.log('Traendo las columnas...')
      console.log('-------------------------')
      return columns
    } catch (err) {
      console.error('Error al traer las columnas', err)
    }
  }

  //-------------------------
  //  INSERTS
  //-------------------------
  //INSERTA UN NUEVO PRODUCTO Y RETORNA EL ID GENERADO
  async insert({
    nombre,
    descripcion = null,
    estado = 3,
    rechazos = 0,
    usuario,
    serie
  }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('Nombre', sql.VarChar(100), nombre)
        .input('Descripcion', sql.VarChar(255), descripcion)
        .input('Estado', sql.SmallInt, estado)
        .input('Rechazos', sql.SmallInt, rechazos)
        .input('Usuario', sql.VarChar(20), usuario)
        .input('Serie', sql.Char(1), serie)
      // console.log(nombre, descripcion)
      const resultado = await request.query(`
          INSERT INTO IND_DESARROLLO_PRODUCTOS (Nombre, Descripcion, Estado, Rechazos, Usuario, Serie)
          OUTPUT INSERTED.DesarrolloProductoId 
          VALUES (@Nombre, @Descripcion, @Estado, 0, @Usuario, @Serie)
          `)
      // console.log('Id generado: ', resultado.recordset[0].DesarrolloProductoId)
      console.log(usuario)
      console.log(
        'Insertando el Producto Nuevo...',
        resultado.recordset[0].DesarrolloProductoId
      )
      return resultado.recordset[0].DesarrolloProductoId // Retorna el Id generado en el nuevo registro insertado
    } catch (err) {
      console.error('Error trying to connect:', err)
    }
  }

  //INSERTA UNA ETAPA PARA EL PRODUCTO EN IND_ETAPAS_ASIGNADAS
  async asingarEtapa({ desarrolloProducto, EtapaId, estado = null }) {
    try {
      // await this.connect()
      // const request = new sql.Request()
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProducto', sql.Int, desarrolloProducto)
        .input('EtapaId', sql.Int, EtapaId)
        .input('Estado', sql.Int, estado)
      const resultado = await request.query(`
          INSERT INTO IND_ETAPAS_ASIGNADAS (DesarrolloProducto, EtapaId)
          VALUES (@DesarrolloProducto, @EtapaId)
      `)
      console.log('Asignando una etapa al producto...', desarrolloProducto)
      console.log('-------------------------')
      return resultado
    } catch (err) {
      console.error('Error al asignar las etapas del nuevo producto :', err)
    }
  }

  //-------------------------
  //  UPDATES
  //-------------------------
  //ACTUALIZA LOS CAMPOS DEL PRODUCTO - ACTUALIZA UNICAMENTE LOS CAMPOS RECIBIDOS
  async update({ DesarrolloProductoId, updates }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProductoId', sql.Int, DesarrolloProductoId)

      const fieldTypes = {
        nombre: sql.VarChar(100),
        descripcion: sql.VarChar(255),
        estado: sql.SmallInt,
        rechazos: sql.SmallInt,
        fechaFin: sql.Date,
        tiempoEstimado: sql.Int,
        tiempoTotal: sql.Int,
        usuario: sql.VarChar(20),
        serie: sql.Char(1)
      }

      //Actualiza solo los campos que se proporcionaron y los agrega al array
      const setClauses = []
      Object.keys(updates).forEach((key) => {
        if (fieldTypes[key]) {
          request.input(key, fieldTypes[key], updates[key])
          setClauses.push(`${key} = @${key}`)
        }
      })

      if (setClauses.length === 0) {
        console.error('No se proporcionaron campos válidos para actualizar')
      }

      //Se vuelve una sola cadena de texto todo el array separando cada elemente por ", "
      const resultado = await request.query(`
            UPDATE IND_DESARROLLO_PRODUCTOS 
              SET ${setClauses.join(', ')} 
            WHERE DesarrolloProductoId = @DesarrolloProductoId`)

      console.log('Update: ', resultado)
      return resultado.recordset
    } catch (err) {
      console.error('Error al actualizar el Producto:', err)
    }
  }
}
