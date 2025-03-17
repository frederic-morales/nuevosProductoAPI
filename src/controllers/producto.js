//--------------------------------------------------------
//CLASE PARA MANEJAR LAS PETICIONES HTTP DE LOS PRODUCTOS
//--------------------------------------------------------
import { Etapas } from '../sql/etapas.js'
import { NuevoProducto } from '../sql/producto.js'
const nuevoProducto = new NuevoProducto()
const etapas = new Etapas()

export class Producto {
  server = async (req, res) => {
    res.status(200).json({ message: 'Server running' })
  }

  //TRAE TODOS LOS PRODUCTOS
  getAll = async (req, res) => {
    const productos = await nuevoProducto.getAll()
    res.status(200).json(productos)
  }

  //TRAE LAS COLUMNAS DE LA TABLA DE NUEVOS PRODUCTOS
  getColumnas = async (req, res) => {
    try {
      const columnas = await nuevoProducto.getColumnas()
      res.status(200).json(columnas)
    } catch (err) {
      console.error('❌ Error al traer las columnas:', err)
      res.status(500).json({ error: 'Error al traer las columnas' })
    }
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

  //OBTENER LA INFO DE LA ETAPA
  asignarEtapas = async (req, res) => {
    const { desarrolloProducto, etapas } = req.body
    console.log(desarrolloProducto, etapas)

    if (!Array.isArray(etapas) || etapas.length === 0)
      res.status(400).json({ error: 'El array de etapas es requerido' })

    try {
      const resultados = []
      for (const etapa of etapas) {
        const { EtapaId } = etapa
        const res = await nuevoProducto.asingarEtapa({
          desarrolloProducto,
          EtapaId
        })
        resultados.push(res)
      }
      res.status(201).json({
        mensaje: 'Todas las etapas fueron asignadas correctamente',
        resultados
      })
    } catch (err) {
      console.error('❌ Error al asignar etapas:', err)
      res.status(500).json({ error: 'Error en la asignación de etapas' })
    }
  }

  //TRAER LA INFO
  getInfo = async (req, res) => {
    const productoId = req.params.productoId
    console.log(productoId)
    console.log(req.params)
    if (!productoId)
      res.status(400).json({ message: 'El Id del producto es obligatorio' })

    try {
      const response = await nuevoProducto.getInfo({ productoId })
      res.status(200).json({
        mensaje: `Traendo la informacion del producto ${productoId}...`,
        productoInfo: response
      })
    } catch (err) {
      console.error('Error al traer la info del producto:', err)
      res.status(500).json({ error: 'Error al traer la info del producto' })
    }
  }

  //TRAER TODAS SUS ETAPAS
  getEtapas = async (req, res) => {
    const productoId = req.params.productoId
    if (!productoId)
      res.status(400).json({ message: 'El Id del producto es obligatorio' })

    try {
      const response = await etapas.etapasPorProducto({ productoId })
      res.status(200).json({
        mensaje: `Traendo las etapas del producto ${productoId}...`,
        productoEtapas: response
      })
    } catch (err) {
      console.error('Error al traer las etapas del producto:', err)
      res.status(500).json({ error: 'Error al traer las etapas del producto' })
    }
  }
}
