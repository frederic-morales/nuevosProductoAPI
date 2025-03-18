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
}
