//----------------------------------------------
//RUTA PARA MANEJAR LAS SOLICITUDES DE PRODUCTO
//----------------------------------------------
import { Router } from 'express'
import { Producto } from '../controllers/producto.js'
const producto = new Producto()

export const producto_router = () => {
  const router = Router()
  //GET
  router.get('/producto', producto.server)
  router.get('/producto/getAll', producto.getAll)
  router.get('/producto/:serieProducto/getAll', producto.getProductosPorSerie)
  router.get('/producto/getColumns', producto.getColumnas)
  router.get('/producto/:productoId', producto.getInfo)
  router.get('/producto/:productoId/etapas', producto.getEtapas)
  //POST
  router.post('/producto/create', producto.createProductoNuevo) // CON LOG
  router.post('/producto/asignarEtapas', producto.asignarEtapas)
  //PATCH
  router.patch('/producto/actualizar', producto.update) // CON LOG
  return router
}
