//--------------------------------------------------------
//CLASE PARA MANEJAR LAS PETICIONES HTTP DE LOS REPORTES
//--------------------------------------------------------
import { Reportes_Sql } from '../sql/reportes.js'
const reportes = new Reportes_Sql()

export class Reportes {
  //TRAE TODOS LOS PRODUCTOS DE UN USUARIO ENCARGADO
  getProductosPorUsuario = async (req, res) => {
    try {
      const serie = req?.params?.serie
      const usuario = req?.params?.usuario
      if (!serie || !usuario) {
        res
          .status(400)
          .json({ message: 'La serie del producto y usuario son requeridos' })
        return
      }
      const productos = await reportes.getProductosPorUsuario(usuario, serie)
      res.status(200).json(productos)
    } catch (err) {
      console.error('❌ Error al traer los productos por usuario:', err)
      res
        .status(500)
        .json({ error: 'Error al traer los productos por usuario' })
    }
  }
}
