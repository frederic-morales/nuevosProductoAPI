//--------------------------------------------------------
//CLASE PARA MANEJAR LAS PETICIONES HTTP DE LOS PRODUCTOS
//--------------------------------------------------------
import { NuevoProducto } from '../sql/producto.js'
const nuevoProducto = new NuevoProducto()

export class Producto {
  server = async (req, res) => {
    res.status(200).json({ message: 'Server running' })
  }
  getAll = async (req, res) => {
    const productos = await nuevoProducto.getAll()
    res.status(200).json(productos)
  }
  getColumnas = async (req, res) => {
    const columnas = await nuevoProducto.getColumnas()
    res.status(200).json(columnas)
  }

  //INICIAR UN PRODUCTO NUEVO
  createProductoNuevo = async (req, res) => {
    const { nombre, descripcion } = req.body
    // console.log(req.body)
    if (nombre && descripcion) {
      const nuevoProductoId = await nuevoProducto.insert({
        nombre,
        descripcion
      })
      console.log(nuevoProductoId)
      res.status(200).json({ nuevoProductoId: nuevoProductoId })
    } else {
      res.status(400).json({ error: 'Nombre y Descripcion son obligatorios' })
    }
  }

  //ASIGNAR ETAPAS
  asignarEtapas = async (req, res) => {
    const { etapas } = req.body
    if (!Array.isArray(etapas) || etapas.length === 0) {
      return res.status(400).json({ error: 'El array de etapas es requerido' })
    }

    // Ejecutar todas las inserciones en paralelo con Promise.all()
    try {
      const resultados = await Promise.all(
        etapas.map((etapa) => nuevoProducto.asingarEtapa(etapa))
      )
      res.status(201).json({
        mensaje: 'Todas las etapas fueron asignadas correctamente',
        resultados
      })
    } catch (err) {
      console.error('❌ Error al asignar etapas:', err)
      res.status(500).json({ error: 'Error en la asignación de etapas' })
    }
  }
}
