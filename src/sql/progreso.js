//-----------------------------------------------------------
//CLASE PARA MANEJAR LAS CONSULTAS DEL PROGRESO DE LAS ETAPAS
//-----------------------------------------------------------
import { poolPromise } from './configDB.js'
import sql from 'mssql'

export class Progreso {
  async iniciar({
    desarrolloProducto,
    etapa,
    usuario,
    estado = 1, // Por defecto al iniciar una etapa
    descripcionEstado = 'Iniciado'
  }) {
    try {
      // const request = new sql.Request()
      const pool = await poolPromise
      const request = pool
        .request()
        .input('DesarrolloProducto', sql.Int, desarrolloProducto)
        .input('Etapa', sql.Int, etapa)
        .input('Usuario', sql.SmallInt, usuario)
        .input('Estado', sql.Int, estado)
        .input('DescripcionEstado', sql.VarChar(100), descripcionEstado)

      const resultado = await request.query(`
          INSERT INTO IND_PROGRESO_ETAPAS
          (DesarrolloProducto, Etapa, Usuario, Estado, DescripcionEstado)
          OUTPUT INSERTED.ProgresoEtapaId --Retorna el ID generado
          VALUES (@DesarrolloProducto, @Etapa, @Usuario, @Estado, @DescripcionEstado)
        `)

      return resultado.recordset
    } catch (err) {
      console.error('Error al iniciar la etapa!!:', err)
    }
  }

  async update({
    progresoEtapaId,
    desarrolloProducto,
    fechaFinal = null,
    estado, // Por defecto al iniciar una etapa
    descripcionEstado
  }) {
    try {
      // const request = new sql.Request()
      const pool = await poolPromise
      const request = pool
        .request()
        .input('ProgresoEtapaId', sql.Int, progresoEtapaId)
        .input('DesarrolloProducto', sql.Int, desarrolloProducto)
        .input('FechaFinal', sql.Date, fechaFinal)
        .input('Estado', sql.Int, estado)
        .input('DescripcionEstado', sql.VarChar(100), descripcionEstado)

      const resultado = await request.query(`
            UPDATE IND_PROGRESO_ETAPAS
                SET FechaFinal = @FechaFinal, Estado = @Estado,
            WHERE ProgresoEtapaId = @ProgresoEtapaId 
            AND DesarrolloProducto = @DesarrolloProducto
        `)
      return resultado
    } catch (err) {
      console.error('Error al actualizar la etapa!!:', err)
    }
  }
}
