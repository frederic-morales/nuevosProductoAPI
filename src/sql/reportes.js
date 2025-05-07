//--------------------------------------------------------
//CLASE PARA MANEJAR LAS CONSULTAS DE LOS REPORTES
//--------------------------------------------------------
import { poolPromise } from './configDB'
import sql from 'mssql'

export class Reportes {
  //TRAE TODOS LOS PRODUCTOS POR USUARIO RESPONSABLE Y SERIE
  async getProductosPorUsuario(usuario, serie) {
    try {
      const pool = await poolPromise
      const result = await pool
        .request()
        .input('Usuario', sql.VarChar(20), usuario)
        .input('Serie', sql.Char(1), serie)
        .query(`SELECT * FROM IND_DESARROLLO_PRODUCTOS 
                WHERE Usuario = @Usuario
                AND Serie = @Serie`)

      return result.recordset
    } catch (err) {
      console.error('Error al traer los productos por usuario!!:', err)
    }
  }
}
