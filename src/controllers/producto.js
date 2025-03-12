import { NuevoProducto } from '../sql/producto.js'
const nuevoProducto = new NuevoProducto()

export class Producto {
  server = async (req, res) => {
    res.status(400).json({ message: 'Server running' })
  }
  getAll = async (req, res) => {
    const productos = await nuevoProducto.getAll()
    // console.log(productos)
    res.status(400).json(productos)
  }
}
