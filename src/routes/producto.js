//----------------------------------------------
//RUTA PARA MANEJAR LAS SOLICITUDES DE PRODUCTO
//----------------------------------------------
import { Router } from 'express'
import { Producto } from '../controllers/producto.js'
const producto = new Producto()

export const productoRouter = () => {
  const router = Router()
  router.get('/producto', producto.server)
  router.get('/producto/getAll', producto.getAll)
  router.get('/producto/getColumns', producto.getColumnas)
  router.post('/producto/create', producto.createProductoNuevo)
  router.post('/producto/asignarEtapas', producto.asignarEtapas)
  return router
}
