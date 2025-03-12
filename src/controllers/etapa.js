import { Etapas } from '../sql/etapas.js'
const etapas = new Etapas()

export class Etapa {
  server = async (req, res) => {
    res.status(400).json({ message: 'Server running - etapa' })
  }
  getAll = async (req, res) => {
    const productos = await etapas.getAll()
    // console.log(productos)
    res.status(400).json(productos)
  }
}
