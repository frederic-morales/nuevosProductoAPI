import { Etapas_sql } from '../sql/etapas.js'
import sendNotificacion from '../notifications/sendEmail.js'
const etapas = new Etapas_sql()

export class Etapa {
  //-------------------------
  //  GETS
  //-------------------------
  server = async (req, res) => {
    res.status(200).json({ message: 'Server running - etapa' })
  }

  //TRAE TODAS LAS ETAPAS
  getAll = async (req, res) => {
    try {
      const etapasAll = await etapas.getAll()
      const etapasConUsuarios = etapasAll.map(async (etapa) => {
        const EtapaId = etapa.EtapaId
        const usuarios = await etapas.getUsuariosAsignados({ EtapaId })
        const procesosResponsables = await etapas.getProcesosResponsables({
          EtapaId
        })
        // console.log(procesosResponsables)
        return {
          ...etapa,
          usuariosAsignados: usuarios,
          procesosResponsables: procesosResponsables
        }
      })
      // Espera a que todas las consultas se completen antes de enviar la informacion al usuario
      const response = await Promise.all(etapasConUsuarios)
      res.status(200).json(response)
    } catch (err) {
      console.error('❌ Error al traer todas las etapas:', err)
      res.status(500).json({ error: 'Error en la obtención de las etapas' })
    }
  }

  //OBTIENE LOS USUARIOS ASIGNADOS A UNA ETAPA
  getUsuariosAsignados = async (req, res) => {
    const EtapaId = req.params.etapaId
    if (!EtapaId) {
      res.status(400).json({ message: 'El EtapaId es obligatorio' })
      return
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

  //OBTIENE LA TODA LA INFORMACION DE UNA ETAPA
  getProgresoInfo = async (req, res) => {
    const desarrolloProductoId = req.params.desarrolloProductoId
    const etapaId = req.params.etapaId

    if (!etapaId || !desarrolloProductoId) {
      res
        .status(400)
        .json({ message: 'El EtapaId y desarrolloProductoId es obligatorio' })
      return
    }

    try {
      const infoEtapa = await etapas.getProgresoInfo({
        desarrolloProductoId,
        etapaId
      })

      res
        .status(200)
        .json({ message: `Traendo la etapa ${etapaId}`, infoEtapa: infoEtapa })
      console.log(infoEtapa)
    } catch (err) {
      console.error('❌ Error al obtener la informacion de la etapa:', err)
      res.status(500).json({ error: 'Error en la obtención de la etapa' })
    }
  }

  getProgresoHistorial = async (req, res) => {
    const DesarrolloProductoId = req.params.ProductoId
    const EtapaId = req.params.EtapaId

    console.log(DesarrolloProductoId, EtapaId)

    if (!DesarrolloProductoId || !EtapaId) {
      res.status(400).json({
        message: 'DesarrolloProductoId y EtapaId es obligatorio'
      })
      return
    }

    try {
      const response = await etapas.getProgresoHistorial({
        DesarrolloProductoId,
        EtapaId
      })
      res.status(200).json({
        message: `Traendo el historial de la etapa ${EtapaId}`,
        response: response
      })
      console.log(response)
    } catch (err) {
      console.error('❌ Error al obtener el historial de la etapa:', err)
      res.status(500).json({ error: 'Error al obtener el historial' })
    }
  }

  //-------------------------
  //  POSTS
  //-------------------------
  //ASIGNA USUARIOS A UNA ETAPA
  asignarUsuarios = async (req, res) => {
    const { EtapaId, Usuarios } = req.body
    if (!EtapaId || !Array.isArray(Usuarios) || Usuarios.length === 0) {
      // Verifica si el EtapaId y los usuarios esta presentes
      res
        .status(400)
        .json({ message: 'EtapaId y los usuarios son obligatorios' })
      return
    }

    try {
      const usuariosAnteriores = await etapas.getUsuariosAsignados({ EtapaId }) // Trae los usuarios asignados actualmente a la etapa
      const currentSet = new Set(usuariosAnteriores.map((u) => u.Usuario))
      const newSet = new Set(Usuarios.map((u) => u.Usuario))

      const usuariosParaAgregar = Usuarios.filter(
        (usuario) => !currentSet.has(usuario.Usuario)
      )
      const usuariosParaEliminar = usuariosAnteriores.filter(
        (usuario) => !newSet.has(usuario.Usuario)
      )

      const resultados = []

      for (const usuario of usuariosParaAgregar) {
        // Asigna los usuarios a la etapa
        const resultado = await etapas.asingarUsuario({
          EtapaId,
          Usuario: usuario.Usuario
        })
        resultados.push(resultado)
      }

      for (const usuario of usuariosParaEliminar) {
        // Elimina los usuarios de la etapa
        const resultado = await etapas.deleteUsuarioDeEtapa({
          EtapaId,
          Usuario: usuario.Usuario
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

  //INSERTA UN REGISTRO EN IND_PROGRESO_ETAPAS
  iniciarEtapa = async (req, res) => {
    // console.log(EtapaId, CodigoEmpleado, DesarrolloProductoId)
    const { EtapaId, Usuario, DesarrolloProductoId } = req.body
    if (!EtapaId || !Usuario || !DesarrolloProductoId) {
      res.status(400).json({
        mensaje: 'EtapaId, Usuario y DesarrolloProductoId son obligatorios'
      })
      return
    }
    try {
      //Crea un nuevo Registro
      const resInsert = await etapas.iniciarEtapa({
        EtapaId,
        Usuario,
        DesarrolloProductoId
      })
      // console.log(resInsert)
      //Actualiza el estado la etapa asignada
      const resUpdate = await etapas.actualizarEstadoAsignacion({
        DesarrolloProductoId,
        EtapaId
      })

      //Envia Notificacion de Inicio de Etapa
      const resEnviarNotificacion = await sendNotificacion({
        DesarrolloProductoId,
        EtapaId
      })

      // console.log(resEnviarNotificacion)
      // console.log(resUpdate)
      res.status(200).json({
        mensaje: 'Etapa Inciada exitosamente...',
        resultInsert: resInsert,
        resultUpdate: resUpdate,
        resEnviarNotificacion: resEnviarNotificacion
      })
    } catch (err) {
      console.error('❌ Error al obtener la informacion de la etapa:', err)
      res.status(500).json({ error: 'Error en la obtención de la etapa' })
    }
  }

  //INSERTA UN REGISTRO EN IND_PROGRESO_ETAPAS_HISTORIAL
  agregarActualizacion = async (req, res) => {
    const { ProgresoEtapaId, RutaDoc, Descripcion, Estado, EstadoDescripcion } =
      req.body
    if (!ProgresoEtapaId || !Estado || !EstadoDescripcion) {
      res.status(400).json({
        mensaje: 'ProgresoEtapaId y Estado y EstadoDescri son obligatorios'
      })
      return
    }

    try {
      const response = await etapas.agregarActualizacion({
        ProgresoEtapaId,
        Estado,
        RutaDoc,
        Descripcion
      })

      const actualizacion = await etapas.actualizarProgresoEtapa({
        Estado,
        ProgresoEtapaId,
        EstadoDescripcion
      })

      res.status(200).json({
        mensaje: 'Actualizacion agregada con exito',
        response: response,
        actualizacion: actualizacion
      })
    } catch (err) {
      console.error('❌ Error al obtener la informacion de la etapa:', err)
      res.status(500).json({ error: 'Error en la obtención de la etapa' })
    }
  }
}
