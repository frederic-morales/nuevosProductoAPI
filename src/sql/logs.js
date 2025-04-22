import { poolPromise } from './configDB.js'
import sql from 'mssql'

const insertLog = async ({
  NombreTabla,
  TipoOperacion,
  Descripcion,
  UsuarioApp,
  IpOrigen,
  IdEvento
}) => {
  try {
    const pool = await poolPromise
    const request = pool
      .request()
      .input('NombreTabla', sql.NVarChar(100), NombreTabla)
      .input('TipoOperacion', sql.NVarChar(20), TipoOperacion)
      .input('Descripcion', sql.NVarChar(250), Descripcion)
      .input('UsuarioApp', sql.NVarChar(100), UsuarioApp)
      .input('IpOrigen', sql.NVarChar(50), IpOrigen)
      .input('IdEvento', sql.Int, IdEvento)

    const result = await request.query(`
        INSERT INTO LOG_IND_PROD_NUEVOS (NombreTabla, TipoOperacion, Descripcion, UsuarioApp, IpOrigen, IdEvento)
            VALUES (@NombreTabla, @TipoOperacion, @Descripcion, @UsuarioApp, @IpOrigen, @IdEvento)`)

    console.log('Log insertado:', result)
  } catch (err) {
    console.log('Error al insertar el log:', err)
  }
}

export default insertLog
