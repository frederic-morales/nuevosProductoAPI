import { Router } from 'express'
import { Etapa } from '../controllers/etapa.js'
import { uploadFile } from '../files/files.js'
// saveFile.single('RutaDoc'),
const etapa = new Etapa()

export const etapa_router = () => {
  const router = Router()
  //GET
  router.get('/etapa', etapa.server)
  router.get('/etapa/getAll', etapa.getAll)
  router.get('/etapa/:etapaId/usuarios', etapa.getUsuariosAsignados)
  router.get('/etapas/:desarrolloProductoId/:etapaId', etapa.getProgresoInfo)
  router.get(
    '/etapas/:ProductoId/historial/:EtapaId',
    etapa.getProgresoHistorial
  )

  //NUEVO
  router.get(
    '/etapas/progresoActual/:desarrolloProductoId/:etapaId/asignacion/:Id',
    etapa.getProgresoActual
  )

  router.get('/etapa/historial/:rutaFile', etapa.getFileProgreso)
  router.get(
    '/etapasEnProcesoActual/:ProductoId',
    etapa.getEpatasEnProcesoActual
  )
  //POST
  router.post('/etapa/asignarUsuarios', etapa.asignarUsuarios)
  router.post('/etapa/iniciar', etapa.iniciarEtapa)
  router.post(
    '/etapa/progreso/actualizacion',
    uploadFile.single('Archivo'),
    etapa.agregarActualizacion
  )
  router.post('/etapa/reasignarEtapas', etapa.reasignarEtapas)
  //DELETE
  router.delete('/etapa/historial', etapa.deleteHistorialEtapa)
  return router
}
