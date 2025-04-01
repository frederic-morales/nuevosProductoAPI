import { Usuarios } from '../sql/usuarios.js'
const usuarios = new Usuarios()

export class Usuarios_con {
  //-------------------------
  //  GETS
  //-------------------------

  //TRAE TODOS LOS USUARIOS
  getAll = async (req, res) => {
    try {
      const response = await usuarios.getAll()
      res.status(200).json(response)
    } catch (err) {
      console.error('❌ Error al traer los usuarios:', err)
      res.status(500).json({ error: 'Error al traer los usuarios' })
    }
  }

  //TRAE LOS USUARIOS POR GRUPO
  getGrupo = async (req, res) => {
    const CodigoGrupo = req.params.codigoGrupo
    if (!CodigoGrupo) {
      res
        .status(400)
        .json({ message: 'CodigoGrupo es requerido en los parametros' })
      return
    }
    try {
      const response = await usuarios.getGrupo({ CodigoGrupo })
      res.status(200).json({
        message: `Traendo el grupo de usuarios ${CodigoGrupo}`,
        usuarios: response
      })
    } catch (err) {
      console.error('❌ Error al traer el grupo de usuarios:', err)
      res.status(500).json({ error: 'Error al traer los usuarios del grupo' })
    }
  }

  //-------------------------
  //  POST
  //-------------------------

  //VERIFICACION DE USUARIO LOGIN
  verificacionUsuario = async (req, res) => {
    const { Usuario, Password } = req.body
    console.log(Usuario, Password)
    if ((!Usuario, !Password)) {
      res.status(400).json({ message: 'Debe ingresar Usuario y Password' })
      return
    }
    try {
      const verificacion = await usuarios.verificacionUsuario({
        Usuario,
        Password
      })
      const usuario = await usuarios.informacionUsuario({ Usuario })
      switch (verificacion) {
        case 0:
          res.status(200).json({
            message: `Usuario ${Usuario} verificado correctamente...`,
            verificacion: true,
            user: usuario[0]
          })
          break
        case 1:
          res.status(200).json({
            message: `Usuario ${Usuario} no encontrado...`,
            verificacion: false,
            user: {}
          })
          break
        case 2:
          res.status(200).json({
            message: `Contraseña incorrecta...`,
            verificacion: false,
            user: {}
          })
          break
      }
    } catch (err) {
      console.error('❌ Error al verificar usuario:', err)
      res.status(500).json({ error: 'Error al verificar usuario' })
    }
  }
}
