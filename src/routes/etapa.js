import { Router } from 'express'
import { Etapa } from '../controllers/etapa.js'

const etapa = new Etapa()

export const etapa_router = () => {
  const router = Router()
  //GET
  router.get('/etapa', etapa.server)
  router.get('/etapa/getAll', etapa.getAll)
  router.get('/etapa/:etapaId/usuarios', etapa.getUsuariosAsignados)
  router.get('/:etapaAsignadaId')
  //POST
  router.post('/etapa/asignarUsuarios', etapa.asignarUsuarios)
  return router
}
