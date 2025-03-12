//--------------------------------------------------------
//CLASE PARA MANEJAR LAS CONSULTAS DE LAS ETAPAS
//--------------------------------------------------------
import { sqlConfig } from './configDB.js'
import sql from 'mssql'

export class Etapas {
  constructor() {
    this.connection = null
  }

  async connect() {
    try {
      this.connection = await sql.connect(sqlConfig)
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

  async selectAll() {
    try {
      const result = await sql.query`SELECT * FROM IND_ETAPAS`
      return result.recordset
    } catch (err) {
      console.error('Error al traer las etapas!!:', err)
    }
  }

  async insert(nombre, descripcion = null, tiempoEstimado = null) {
    try {
      const request = new sql.request()
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
    }
  }
}

// PROBANDO LA CLASE
;(async () => {
  const etapas = new Etapas()
  await etapas.connect() // Abrir conexión una sola vez
  const iniciarEtapa = await etapas.iniciar({
    desarrolloProducto: 10,
    etapa: 2,
    usuario: 826
  })
  console.log(iniciarEtapa)
  await etapas.close() // Cerrar conexión al finalizar
})()
