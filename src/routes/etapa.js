import { Router } from 'express'
import { Etapa } from '../controllers/etapa.js'

const etapa = new Etapa()

export const etapaRouter = () => {
  const router = Router()
  router.get('/etapa', etapa.server)
  router.get('/etapa/getAll', etapa.getAll)
  router.get('/etapa/info/:id')
  return router
}
