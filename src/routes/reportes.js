//-------------------------------------------------
//RUTA PARA MANEJAR LAS SOLICITUDES DE LOS REPORTES
//-------------------------------------------------
import { Router } from 'express'
import { Reportes } from '../controllers/reportes.js'
const reportes = new Reportes()

export const reportes_router = () => {
  const router = Router()
  //GET
  router.get(
    '/reportes/productosUsuario/:usuario/:serie',
    reportes.getProductosPorUsuario
  )
  return router
}
