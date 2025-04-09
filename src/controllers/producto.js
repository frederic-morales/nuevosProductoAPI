//--------------------------------------------------------
//CLASE PARA MANEJAR LAS PETICIONES HTTP DE LOS PRODUCTOS
//--------------------------------------------------------
import { Etapas_sql } from '../sql/etapas.js'
import { NuevoProducto } from '../sql/producto.js'
const nuevoProducto = new NuevoProducto()
const etapas = new Etapas_sql()

export class Producto {
  //-------------------------
  //  GETS
  //-------------------------
  server = async (req, res) => {
    res.status(200).json({ message: 'Server running' })
  }

  //TRAE TODOS LOS PRODUCTOS
  getAll = async (req, res) => {
    const productos = await nuevoProducto.getAll()
    res.status(200).json(productos)
  }

  //TRAE TODOS LOS PRODUCTOS POR SERIE
  getProductosPorSerie = async (req, res) => {
    try {
      const serie = req.params.serieProducto
      if (!serie) {
        res.status(400).json({ message: 'Serie del producto es obligatorio' })
        return
      }
      const productos = await nuevoProducto.getProductosPorSerie(serie)
      res.status(200).json({
        message: `Traendo todos los productos con serie ${serie}`,
        productos: productos
      })
    } catch (err) {
      console.error('❌ Error al traer los productos por serie:', err)
      res.status(500).json({ error: 'Error al traer las columnas' })
    }
  }

  //TRAE LAS COLUMNAS DE LA TABLA DE NUEVOS PRODUCTOS
  getColumnas = async (req, res) => {
    try {
      const columnas = await nuevoProducto.getColumnas()
      if (columnas) {
        res.status(200).json(columnas)
      }
    } catch (err) {
      console.error('❌ Error al traer las columnas:', err)
      res.status(500).json({ error: 'Error al traer las columnas' })
    }
  }

  //TRAER LA INFO
  getInfo = async (req, res) => {
    const productoId = req.params.productoId
    console.log('Producto ID:')
    console.log(productoId)

    if (!productoId) {
      res.status(400).json({ message: 'El Id del producto es obligatorio' })
      return
    }

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

  //TRAE TODAS LAS ETAPAS DE UN PRODUCTO
  getEtapas = async (req, res) => {
    const productoId = req.params.productoId
    if (!productoId) {
      res.status(400).json({ message: 'El Id del producto es obligatorio' })
      return
    }
    try {
      const etapasProducto = await etapas.getEtapasAsignadas({
        ProductoId: productoId
      })

      const etapasConUsuarios = etapasProducto.map(async (etapa) => {
        const EtapaId = etapa?.EtapaId

        // TRAE LOS USUARIOS ASIGNADOS A CADA ETAPA
        const usuarios = await etapas.getUsuariosAsignados({ EtapaId })

        // TRAE LOS PROCESOS ASIGNADOS A CADA ETAPA
        const procesosResponsables = await etapas.getProcesosResponsables({
          EtapaId
        })

        // VERIFICA QUE ETAPA SE PUEDE INICIAR
        const permitirInicio = await etapas.verificarDependencias({
          DesarrolloProductoId: productoId,
          EtapaId: EtapaId
        })

        return {
          ...etapa,
          usuariosAsignados: usuarios,
          procesosResponsables: procesosResponsables,
          PermitirInicio: permitirInicio === 1 ? true : false // SI EL SP RETORNA 1 ES PORQUE LA ETAPA SE PUEDE INICIAR
        }
        //
      })

      // Espera a que todas las consultas se completen antes de enviar la informacion al usuario
      const response = await Promise.all(etapasConUsuarios)
      const etapasAnteriores = await etapas.getEtapasIniciadasAnteriores({
        ProductoId: productoId
      })

      res.status(200).json({
        mensaje: `Traendo las etapas del producto ${productoId}...`,
        productoEtapas: response,
        etapasAnteriores: etapasAnteriores
      })
    } catch (err) {
      console.error('Error al traer las etapas del producto:', err)
      res.status(500).json({ error: 'Error al traer las etapas del producto' })
    }
  }

  //-------------------------
  //  POST
  //-------------------------

  //INICIAR UN PRODUCTO NUEVO
  createProductoNuevo = async (req, res) => {
    const { nombre, descripcion, usuario, serie } = req.body
    console.log(usuario)
    // console.log(req.body)
    if (nombre && descripcion && usuario && serie) {
      const nuevoProductoId = await nuevoProducto.insert({
        nombre,
        descripcion,
        usuario,
        serie
      })
      console.log(nuevoProductoId)
      res.status(200).json({ nuevoProductoId: nuevoProductoId })
    } else {
      res.status(400).json({ error: 'Nombre y Descripcion son obligatorios' })
    }
  }

  //ASIGNACION DE LAS ETAPAS
  asignarEtapas = async (req, res) => {
    const { desarrolloProducto, etapas } = req.body
    console.log(desarrolloProducto, etapas)

    if (!Array.isArray(etapas) || etapas.length === 0 || !desarrolloProducto) {
      res.status(400).json({
        error: 'El desarrolloproductoId y el array de etapas es requerido'
      })
      return
    }

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

  //-------------------------
  //  PATCH
  //-------------------------

  //UPDATE PRODUCTO
  update = async (req, res) => {
    const { desarrolloProductoId, updates } = req.body
    console.log(desarrolloProductoId, updates)

    try {
      if (!desarrolloProductoId) {
        res
          .status(400)
          .json({ mensaje: 'desarrolloProductoId es obligatorio...' })
        console.log('desarrolloProductoId no recibido')
        return
      }

      const DesarrolloProductoId = desarrolloProductoId
      const response = await nuevoProducto.update({
        DesarrolloProductoId,
        updates
      })

      res.status(200).json({
        mensaje: `Actualizacion compleada con exito para el producto ${desarrolloProductoId}`,
        response: response,
        updates: updates
      })
    } catch (err) {
      console.error('Error al traer las etapas del producto:', err)
      res.status(500).json({ error: 'Error al traer las etapas del producto' })
    }
  }
}
