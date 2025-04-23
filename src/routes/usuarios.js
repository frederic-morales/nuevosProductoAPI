//-------------------------------------------------
//RUTA PARA MANEJAR LAS SOLICITUDES DE LOS USUARIOS
//-------------------------------------------------
import { Router } from 'express'
import { Usuarios_con } from '../controllers/usuarios.js'
const usuarios = new Usuarios_con()

export const usuario_router = () => {
  const router = Router()
  router.get('/usuarios', usuarios.getAll)
  router.get('/usuarios/:codigoGrupo', usuarios.getGrupo)
  router.get(
    '/usuarios/etapasAsignadas/:user/:serie',
    usuarios.getEtapasAsignadas
  )
  //POST
  router.post('/usuarios/verificacion', usuarios.verificacionUsuario) // CON LOG
  return router
}
