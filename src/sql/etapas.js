//--------------------------------------------------------
//CLASE PARA MANEJAR LAS CONSULTAS DE LAS ETAPAS
//--------------------------------------------------------
import { sqlConfig } from './configDB.js'
import sql from 'mssql'

export class Etapas {
  constructor() {
    this.sqlConfig = sqlConfig
    this.connection = null
  }

  async connect() {
    try {
      this.connection = await sql.connect(this.sqlConfig)
      console.log('Conexión establecida!!')
    } catch (err) {
      console.error('Error al conectar:', err)
    }
  }

  async close() {
    try {
      if (this.connection) {
        this.connection = await sql.close()
        console.log('Conexion cerrada!!')
      }
    } catch (err) {
      console.log('Error al cerrar la conexion', err)
    }
  }

  async getAll() {
    try {
      await this.connect()
      const result = await sql.query`SELECT * FROM IND_ETAPAS`
      return result.recordset
    } catch (err) {
      console.error('Error al traer las Etapas!!:', err)
    } finally {
      await this.close()
    }
  }

  //TRAE TODAS LAS ETAPAS DEL PRODUCTO DADO
  async etapasPorProducto({ productoId }) {
    try {
      await this.connect()
      const request = new sql.Request()
      request.input('DesarrolloProducto', sql.Int, productoId)
      const resultado = await request.query(`
          SELECT A.DesarrolloProducto AS ProductoId, A.Estado, A.EtapasAsignadasId,
            E.EtapaId, E.Nombre, E.Descripcion, E.FechaCreacion, E.TiempoEstimado,
            P.ProgresoEtapaId, P.Usuario, P.FechaInicio, P.FechaFinal 
          FROM IND_ETAPAS E
            JOIN IND_ETAPAS_ASIGNADAS A ON A.EtapaId = E.EtapaId
            LEFT JOIN IND_PROGRESO_ETAPAS P ON P.Etapa = A.EtapaId
          WHERE A.DesarrolloProducto = @DesarrolloProducto
            `)
      return resultado.recordset
    } catch (err) {
      console.error('Error al traer las Etapas!!:', err)
    } finally {
      await this.close()
    }
  }

  //TRAE TODA LA INFORMACION DE LA ETAPA SELECCIONADA
  async historial({ etapaAsignadaId, productoId }) {
    try {
      await this.connect()
      const request = new sql.Request()
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
      return resultado.recordset
    } catch (err) {
      console.error('Error al traer las Etapas!!:', err)
    } finally {
      await this.close()
    }
  }

  //INSERTA UNA NUEVA ETAPA
  async insert({ nombre, descripcion = null, tiempoEstimado = null }) {
    try {
      await this.connect()
      const request = new sql.Request()
        .input('Nombre', sql.VarChar(100), nombre)
        .input('Descripcion', sql.VarChar(255), descripcion)
        .input('TiempoEstimado', sql.Date, tiempoEstimado)

      const resultado = await request.query(`
          INSERT INTO IND_ETAPAS (Nombre, Descripcion, TiempoEstimado)
            OUTPUT INSERTED.EtapaId 
          VALUES (@Nombre, @Descripcion, @TiempoEstimado)
        `)

      // Retorna el Id generado en el nuevo registro insertado
      return resultado.recordset[0].EtapaId
    } catch (err) {
      console.error('Error al crear una nueva etapa!!:', err)
    } finally {
      await this.close()
    }
  }
}
