import { Router } from 'express'
import { Producto } from '../controllers/producto.js'

const producto = new Producto()

export const productoRouter = () => {
  const router = Router()
  router.get('/producto', producto.server)
  router.get('/producto/getAll', producto.getAll)
  return router
}
