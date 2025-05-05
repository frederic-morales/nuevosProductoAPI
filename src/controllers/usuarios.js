import { Usuarios } from '../sql/usuarios.js'
import { Etapas_sql } from '../sql/etapas.js'
import jwt from 'jsonwebtoken'
import process from 'process'
import { config } from 'dotenv'
import insertLog from '../sql/logs.js'
config()
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

  //TRAE LAS ETAPAS ASIGNADAS AL USUARIO SEPARADAS POR PRODUCTO
  getEtapasAsignadas = async (req, res) => {
    const Usuario = req.params.user
    const Serie = req.params.serie

    // console.log(Usuario, Serie)
    if (!Usuario || !Serie) {
      res.status(400).json({ message: 'El usuario es obligatorio' })
    }

    try {
      // console.log(Serie)
      const productosUsuario = await usuarios.getProductosPorUsuario({
        Usuario,
        Serie
      })

      const productoConEtapas = productosUsuario.map(async (producto) => {
        const DesarrolloProductoId = producto?.DesarrolloProductoId

        const etapasUsuario = await usuarios.getUsuarioEtapas({
          Usuario,
          DesarrolloProductoId
        })

        const etapasConPermiso = etapasUsuario.map(async (etapa) => {
          const EtapaId = etapa?.EtapaId
          const ProductoId = etapa?.ProductoId

          const permitirInicio = await etapas.verificarDependencias({
            DesarrolloProductoId: ProductoId,
            EtapaId: EtapaId
          })
          // console.log(permitirInicio)

          return {
            ...etapa,
            PermitirInicio: permitirInicio === 1 ? true : false // SI EL SP RETORNA 1 ES PORQUE LA ETAPA SE PUEDE INICIAR
          }
        })

        const responseEtapas = await Promise.all(etapasConPermiso)
        return {
          ...producto,
          etapas: responseEtapas
        }
      })

      const response = await Promise.all(productoConEtapas)
      res.status(200).json(response)
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
      let token = null
      const usuario = await usuarios.informacionUsuario({ Usuario })
      const user = usuario[0]

      const existeEtapas = await usuarios.verificarUsuarioEtapas({
        Usuario
      })

      // console.log(existeEtapas)
      switch (verificacion) {
        case 0:
          if (
            !existeEtapas &&
            user?.CodigoGrupo != 69
            // && user?.CodigoGrupo != 44 &&
            // user?.CodigoGrupo != 35
          ) {
            // Si no tiene etapas asignadas o no es de TEC O ID
            res.status(200).json({
              message: `El usuario ${Usuario} no tiene permiso de acceder...`,
              verificacion: false,
              user: {}
            })
            return
          }
          token = jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: '5h'
          })
          console.log('Token generado:', token)
          res.status(200).json({
            message: `Usuario ${Usuario} verificado correctamente...`,
            verificacion: true,
            user: usuario[0],
            token: token
          })

          //INSERTAR LOG
          await insertLog({
            NombreTabla: 'SP_VALIDACION_USUARIO - SP',
            TipoOperacion: 'LOGIN',
            Descripcion: `INICIO DE SESION EXITOSO - ${Usuario}`,
            UsuarioApp: Usuario, // Usuario que inicio sesion
            IpOrigen: req.ip,
            IdEvento: 1
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
