//--------------------------------------------------------
//CLASE PARA MANEJAR LAS CONSULTAS DE LOS NUEVOS PRODUCTOS
//--------------------------------------------------------
import { sqlConfig } from './configDB.js'
import sql from 'mssql'

export class Producto {
  constructor() {
    this.connection = null
  }

  // Abrir la conexion a la DB
  async connect() {
    try {
      this.connection = await sql.connect(sqlConfig)
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
      }
    } catch (err) {
      console.error('Error al cerrar la conexión:', err)
    }
  }

  async selectAll() {
    try {
      const result = await sql.query`SELECT * FROM IND_DESARROLLO_PRODUCTOS`
      return result.recordset
    } catch (err) {
      console.error('Error al traer los Productos:', err)
    }
  }

  async insert({ nombre = null, descripcion = null }) {
    try {
      const request = new sql.Request()
        .input('Nombre', sql.VarChar(100), nombre)
        .input('Descripcion', sql.VarChar(255), descripcion)

      const resultado = await request.query(`
          INSERT INTO IND_DESARROLLO_PRODUCTOS (Nombre, Descripcion)
          OUTPUT INSERTED.DesarrolloProductoId 
          VALUES (@Nombre, @Descripcion)
          `)
      // console.log('Id generado: ', resultado.recordset[0].DesarrolloProductoId)
      return resultado.recordset[0].DesarrolloProductoId // Retorna el Id generado en el nuevo registro insertado
    } catch (err) {
      console.error('Error trying to connect:', err)
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

  async asingarEtapa({ desarrolloProducto, etapaId, estado = null }) {
    try {
      const request = new sql.Request()
        .input('DesarrolloProducto', sql.Int, desarrolloProducto)
        .input('EtapaId', sql.Int, etapaId)
        .input('Estado', sql.Int, estado)

      const resultado = await request.query(`
          INSERT INTO IND_ETAPAS_ASIGNADAS (DesarrolloProducto, EtapaId)
          VALUES (@DesarrolloProducto, @EtapaId)
      `)

      return resultado
    } catch (err) {
      console.error('Error al asignar las etapas del nuevo producto :', err)
    }
  }
}
