//--------------------------------------------------------
//CLASE PARA MANEJAR LAS CONSULTAS DE LOS NUEVOS PRODUCTOS
//--------------------------------------------------------
import { sqlConfig } from './configDB.js'
import sql from 'mssql'

export class NuevoProducto {
  constructor() {
    this.sqlConfig = sqlConfig
    this.connection = null
  }

  // Abrir la conexion a la DB
  async connect() {
    try {
      this.connection = await sql.connect(this.sqlConfig)
      console.log('----------------------')
      console.log('Conexión establecida!!')
    } catch (err) {
      console.error('Error al conectar:', err)
    }
  }

  //Cerrar la conexion de la DB
  async close() {
    try {
      if (this.connection) {
        await this.connection.close()
        console.log('Conexión cerrada!!')
        console.log('----------------------')
      }
    } catch (err) {
      console.error('Error al cerrar la conexión:', err)
    }
  }

  async getAll() {
    try {
      await this.connect()
      const result = await sql.query`SELECT * FROM IND_DESARROLLO_PRODUCTOS`
      return result.recordset
    } catch (err) {
      console.error('Error al traer los Productos!!:', err)
    } finally {
      await this.close()
    }
  }

  async getInfo({ productoId }) {
    try {
      await this.connect()
      const request = new sql.Request().input('ProductoId', sql.Int, productoId)
      const resultado = await request.query(`
          SELECT * 
          FROM IND_DESARROLLO_PRODUCTOS
          WHERE DesarrolloProductoId = @ProductoId
        `)
      return resultado.recordset
    } catch (err) {
      console.error('Error al traer la info del producto...', err)
    } finally {
      await this.close()
    }
  }

  async getColumnas() {
    try {
      await this.connect()
      const resultado = await sql.query`
          SELECT ORDINAL_POSITION, COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'IND_DESARROLLO_PRODUCTOS'
      `

      const columns = await resultado.recordset.map((row) => ({
        ordinalPosition: row.ORDINAL_POSITION,
        columnName: row.COLUMN_NAME,
        dataType: row.DATA_TYPE,
        isNullable: row.IS_NULLABLE === 'YES'
      }))
      // console.log(columns)
      console.log('Traendo las columnas...')
      return columns
    } catch (err) {
      console.error('Error al traer las columnas', err)
    } finally {
      await this.close()
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
      await this.connect()
      const request = new sql.Request()
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
    } finally {
      await this.close()
    }
  }

  async asingarEtapa({ desarrolloProducto, EtapaId, estado = null }) {
    try {
      await this.connect()
      const request = new sql.Request()
        .input('DesarrolloProducto', sql.Int, desarrolloProducto)
        .input('EtapaId', sql.Int, EtapaId)
        .input('Estado', sql.Int, estado)
      const resultado = await request.query(`
          INSERT INTO IND_ETAPAS_ASIGNADAS (DesarrolloProducto, EtapaId)
          VALUES (@DesarrolloProducto, @EtapaId)
      `)
      return resultado
    } catch (err) {
      console.error('Error al asignar las etapas del nuevo producto :', err)
    } finally {
      await this.close()
    }
  }

  async update({
    desarrolloProductoId = null,
    estado = null,
    rechazos = null,
    fechaFin = null,
    tiempoEstimado = null,
    tiempoTotal = null
  }) {
    try {
      const request = new sql.Request()
        .input('DesarrolloProductoId', sql.Int, desarrolloProductoId)
        .input('Estado', sql.SmallInt, estado)
        .input('Rechazos', sql.SmallInt, rechazos)
        .input('FechaFin', sql.Date, fechaFin)
        .input('TiempoEstimado', sql.Int, tiempoEstimado)
        .input('TiempoTotal', sql.Int, tiempoTotal)
      const resultado = await request.query(`
              UPDATE IND_DESARROLLO_PRODUCTOS 
              SET Estado = @Estado, Rechazos = @Rechazos, FechaFin = @FechaFin,
                TiempoEstimado = @TiempoEstimado, TiempoTotal = @TiempoTotal
              WHERE DesarrolloProductoId = @desarrolloProductoId
              `)
      console.log('Update: ', resultado) // Retorna el Id generado
    } catch (err) {
      console.error('Error al actualizar el Producto:', err)
    }
  }
}
