import { Usuarios } from '../sql/usuarios.js'
const usuarios = new Usuarios()

export class Usuarios_con {
  getAll = async (req, res) => {
    try {
      const response = await usuarios.getAll()
      res.status(200).json(response)
    } catch (err) {
      console.error('❌ Error al traer los usuarios:', err)
      res.status(500).json({ error: 'Error al traer los usuarios' })
    }
  }

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
}
