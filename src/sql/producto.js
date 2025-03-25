//--------------------------------------------------------
//CLASE PARA MANEJAR LAS CONSULTAS DE LOS NUEVOS PRODUCTOS
//--------------------------------------------------------
// import { sqlConfig } from './configDB.js'
// import sql from 'mssql'

import { poolPromise } from './configDB.js'
import sql from 'mssql'

export class NuevoProducto {
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

  async getInfo({ productoId }) {
    try {
      const pool = await poolPromise
      const request = pool.request().input('ProductoId', sql.Int, productoId)
      // const resultado = await request.query(`
      //     SELECT *
      //     FROM IND_DESARROLLO_PRODUCTOS
      //     WHERE DesarrolloProductoId = @ProductoId
      //   `)
      console.log(productoId)

      const resultado = await request.query(`
        SELECT P.DesarrolloProductoId, P.Nombre, P.Descripcion, P.Estado, P.Rechazos, P.FechaInicio, 
        P.FechaFin, P.TiempoEstimado, P.TiempoTotal, P.CodigoEmpleado, P.Serie, U.Nombres, U.Apellidos
        FROM IND_DESARROLLO_PRODUCTOS P 
          LEFT JOIN GEN_USUARIOS U ON P.CodigoEmpleado = U.CodigoEmpleado
        WHERE P.DesarrolloProductoId = @ProductoId
          `)
      return resultado.recordset
    } catch (err) {
      console.error('Error al traer la info del producto...', err)
    }
  }

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

  async insert({
    nombre,
    descripcion = null,
    estado = 3,
    rechazos = 0,
    codigoEmpleado,
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
        .input('CodigoEmpleado', sql.SmallInt, codigoEmpleado)
        .input('Serie', sql.Char(1), serie)
      // console.log(nombre, descripcion)
      const resultado = await request.query(`
          INSERT INTO IND_DESARROLLO_PRODUCTOS (Nombre, Descripcion, Estado, Rechazos, CodigoEmpleado, Serie)
          OUTPUT INSERTED.DesarrolloProductoId 
          VALUES (@Nombre, @Descripcion, @Estado, 0, @CodigoEmpleado, @Serie)
          `)
      // console.log('Id generado: ', resultado.recordset[0].DesarrolloProductoId)
      console.log(codigoEmpleado)
      console.log(
        'Insertando el Producto Nuevo...',
        resultado.recordset[0].DesarrolloProductoId
      )
      return resultado.recordset[0].DesarrolloProductoId // Retorna el Id generado en el nuevo registro insertado
    } catch (err) {
      console.error('Error trying to connect:', err)
    }
  }

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

  async update({ desarrolloProductoId, updates }) {
    try {
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProductoId', sql.Int, desarrolloProductoId)

      const fieldTypes = {
        nombre: sql.VarChar(100),
        descripcion: sql.VarChar(255),
        estado: sql.SmallInt,
        rechazos: sql.SmallInt,
        fechaFin: sql.Date,
        tiempoEstimado: sql.Int,
        tiempoTotal: sql.Int,
        codigoEmpleado: sql.SmallInt,
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
    } catch (err) {
      console.error('Error al actualizar el Producto:', err)
    }
  }
}
