import { Etapas_sql } from '../sql/etapas.js'
const etapas = new Etapas_sql()

export class Etapa {
  server = async (req, res) => {
    res.status(200).json({ message: 'Server running - etapa' })
  }
  getAll = async (req, res) => {
    const productos = await etapas.getAll()
    // console.log(productos)
    res.status(200).json(productos)
  }

  //ASIGNA USUARIOS A UNA ETAPA
  asignarUsuarios = async (req, res) => {
    const { EtapaId, Usuarios } = req.body
    if (!EtapaId || !Array.isArray(Usuarios) || Usuarios.length === 0) {
      // Verifica si el EtapaId y los usuarios esta presentes
      res
        .status(400)
        .json({ message: 'EtapaId y los usuarios son obligatorios' })
    }

    try {
      const usuariosAnteriores = await etapas.getUsuariosAsignados({ EtapaId }) // Trae los usuarios asignados actualmente a la etapa
      const currentSet = new Set(
        usuariosAnteriores.map((u) => u.CodigoEmpleado)
      )
      const newSet = new Set(Usuarios.map((u) => u.CodigoEmpleado))

      const usuariosParaAgregar = Usuarios.filter(
        (usuario) => !currentSet.has(usuario.CodigoEmpleado)
      )
      const usuariosParaEliminar = usuariosAnteriores.filter(
        (usuario) => !newSet.has(usuario.CodigoEmpleado)
      )

      const resultados = []

      for (const usuario of usuariosParaAgregar) {
        // Asigna los usuarios a la etapa
        const resultado = await etapas.asingarUsuario({
          EtapaId,
          CodigoEmpleado: usuario.CodigoEmpleado
        })
        resultados.push(resultado)
      }

      for (const usuario of usuariosParaEliminar) {
        // Elimina los usuarios de la etapa
        const resultado = await etapas.deleteUsuarioDeEtapa({
          EtapaId,
          CodigoEmpleado: usuario.CodigoEmpleado
        })
        resultados.push(resultado)
      }

      res.status(200).json({
        mensaje: 'Los usuarios actualizados correctamente...',
        resultados
      })
    } catch (err) {
      console.error('❌ Error al asignar etapas:', err)
      res.status(500).json({ error: 'Error en la asignación de etapas' })
    }
  }

  //OBTIENE LOS USUARIOS ASIGNADOS A UNA ETAPA
  getUsuariosAsignados = async (req, res) => {
    const EtapaId = req.params.etapaId
    if (!EtapaId) {
      res.status(400).json({ message: 'El EtapaId es obligatorio' })
    }

    try {
      const usuariosAsignados = await etapas.getUsuariosAsignados({ EtapaId })
      res.status(200).json(usuariosAsignados)
      console.log(usuariosAsignados)
    } catch (err) {
      console.error('❌ Error al obtener los usuarios asignados:', err)
      res.status(500).json({ error: 'Error en la obtención de usuarios' })
    }
  }
}
