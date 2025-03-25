import { Router } from 'express'
import { Etapa } from '../controllers/etapa.js'

const etapa = new Etapa()

export const etapa_router = () => {
  const router = Router()
  //GET
  router.get('/etapa', etapa.server)
  router.get('/etapa/getAll', etapa.getAll)
  router.get('/etapa/:etapaId/usuarios', etapa.getUsuariosAsignados)
  router.get('/etapas/:desarrolloProductoId/:etapaId', etapa.getProgresoInfo)
  //POST
  router.post('/etapa/asignarUsuarios', etapa.asignarUsuarios)
  router.post('/etapa/iniciar', etapa.iniciarEtapa)
  return router
}
