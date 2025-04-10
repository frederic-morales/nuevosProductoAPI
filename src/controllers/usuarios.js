import { Usuarios } from '../sql/usuarios.js'
import { Etapas_sql } from '../sql/etapas.js'
const usuarios = new Usuarios()
const etapas = new Etapas_sql()

export class Usuarios_con {
  //-------------------------
  //GETS
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

  getEtapasAsignadas = async (req, res) => {
    const Usuario = req.params.user
    if (!Usuario) {
      res.status(400).json({ message: 'El usuario es obligatorio' })
    }
    try {
      const usuarioEtapas = await usuarios.getUsuarioEtapas({ Usuario })
      const etapasCompletas = usuarioEtapas.map(async (etapa) => {
        const EtapaId = etapa?.EtapaId
        const ProductoId = etapa?.DesarrolloProductoId

        const permitirInicio = await etapas.verificarDependencias({
          DesarrolloProductoId: ProductoId,
          EtapaId: EtapaId
        })

        return {
          ...etapa,
          PermitirInicio: permitirInicio === 1 ? true : false // SI EL SP RETORNA 1 ES PORQUE LA ETAPA SE PUEDE INICIAR
        }
      })
      const response = await Promise.all(etapasCompletas)
      res.status(200).json(response)
      // res.status(200).json(etapas)
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
