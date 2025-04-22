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
    '/etapas/:ProductoId/historial/:EtapaId/progreso/:Id',
    etapa.getProgresoHistorial
  )
  router.get(
    '/etapas/progresoActual/:desarrolloProductoId/:etapaId/asignacion/:Id',
    etapa.getProgresoActual
  )

  // TRAER ARCHIVOS
  router.get(
    '/etapa/historial/:nombreProducto/:nombreEtapa/:archivo',
    etapa.getFileProgreso
  )
  router.get(
    '/etapasEnProcesoActual/:ProductoId',
    etapa.getEpatasEnProcesoActual
  )

  //POST
  router.post('/etapa/asignarUsuarios', etapa.asignarUsuarios) // CON LOG
  router.post('/etapa/iniciar', etapa.iniciarEtapa) // CON LOG
  //ACTUALIZACION DE ETAPA - ARCHIVO OPCIONAL
  router.post(
    '/etapa/progreso/actualizacion',
    uploadFile.single('Archivo'),
    etapa.agregarActualizacion
  ) // CON LOG
  router.post('/etapa/reasignarEtapas', etapa.reasignarEtapas)
  //DELETE
  router.delete('/etapa/historial', etapa.deleteHistorialEtapa)
  return router
}
