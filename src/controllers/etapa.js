import { Etapas_sql } from '../sql/etapas.js'
import { NuevoProducto } from '../sql/producto.js'
import {
  sendNotificacion,
  notificacionSiguientesEtapas
} from '../notifications/sendEmail.js'
import fs from 'fs/promises'
// import fsExists from 'fs.promises.exists'
import { saveFile } from '../files/files.js'
// import path from 'path'
// import process from 'process'

const etapas = new Etapas_sql()
const producto = new NuevoProducto()

export class Etapa {
  //-------------------------
  //  GETS
  //-------------------------
  server = async (req, res) => {
    res.status(200).json({ message: 'Server running - etapa' })
  }

  //NUEVA
  getEpatasEnProcesoActual = async (req, res) => {
    try {
      const DesarrolloProductoId = req.params.ProductoId
      if (!DesarrolloProductoId) {
        res.status(400).json({ message: 'El Id del producto es obligatorio' })
        return
      }

      const etapasIniciadasEnProcesoActual =
        await etapas.getEtapasIniciadasEnProcesoActual({
          ProductoId: DesarrolloProductoId
        })

      res.status(200).json({
        etapasEnProcesoActual: etapasIniciadasEnProcesoActual
      })
    } catch (err) {
      console.error('❌ Error al traer iniciadas en el proceso actual:', err)
      res
        .status(500)
        .json({ error: 'Error al traer iniciadas en el proceso actual' })
    }
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
          procesosResponsables: procesosResponsables,
          PermitirInicio: true
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
      // console.log(usuariosAsignados)
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
      //INFORMACION GENERAL DE LA ETAPA
      const etapaResponse = await etapas.getProgresoInfo({
        desarrolloProductoId,
        etapaId
      })

      //VERIFICA SI LA ETAPA SE PUEDE INICIAR
      const permitirInicio = await etapas.verificarDependencias({
        DesarrolloProductoId: desarrolloProductoId,
        EtapaId: etapaId
      })

      //TRAE LOS USUARIOS QUE PUEDEN INICIAR LA ETAPA
      const usuarios = await etapas.getUsuariosAsignados({ EtapaId: etapaId })

      const infoEtapa = {
        ...etapaResponse,
        usuariosAsignados: usuarios,
        PermitirInicio: permitirInicio === 1 ? true : false
      }

      res.status(200).json({ infoEtapa })
      // console.log(infoEtapa)
    } catch (err) {
      console.error('❌ Error al obtener la informacion de la etapa:', err)
      res.status(500).json({ error: 'Error en la obtención de la etapa' })
    }
  }

  //OBTIENE EL PROGRESO SELECCIONADO POR EL ID DE LA ETAPA ASIGNADA
  getProgresoActual = async (req, res) => {
    const desarrolloProductoId = req.params.desarrolloProductoId
    const etapaId = req.params.etapaId
    const etapasAsignadasId = req.params.Id

    console.log(desarrolloProductoId, etapaId, etapasAsignadasId)

    if (!etapaId || !desarrolloProductoId || !etapasAsignadasId) {
      res.status(400).json({
        message:
          'EtapaId, desarrolloProductoId y EtapaAsignadaId es obligatorio'
      })
      return
    }

    try {
      const progresoEtapa = await etapas.getProgresoSeleccionado({
        DesarrolloProductoId: desarrolloProductoId,
        EtapaId: etapaId,
        EtapasAsignadasId: etapasAsignadasId
      })

      console.log(progresoEtapa)

      res.status(200).json(progresoEtapa)
    } catch (err) {
      console.error('❌ Error al obtener la informacion de la etapa:', err)
      res.status(500).json({ error: 'Error en la obtención de la etapa' })
    }
  }

  getProgresoHistorial = async (req, res) => {
    const DesarrolloProductoId = req.params.ProductoId
    const EtapaId = req.params.EtapaId
    const ProgresoEtapaId = req.params.Id

    if (!DesarrolloProductoId || !EtapaId || !ProgresoEtapaId) {
      res.status(400).json({
        message: 'DesarrolloProductoId y EtapaId es obligatorio'
      })
      return
    }

    try {
      const response = await etapas.getProgresoHistorial({
        DesarrolloProductoId,
        EtapaId,
        ProgresoEtapaId
      })
      res.status(200).json({
        message: `Traendo el historial de la etapa ${EtapaId}`,
        response: response
      })
      // console.log(response)
    } catch (err) {
      console.error('❌ Error al obtener el historial de la etapa:', err)
      res.status(500).json({ error: 'Error al obtener el historial' })
    }
  }

  // TRAE EL ARCHIVO DE PROGRESO
  getFileProgreso = async (req, res) => {
    const { rutaFile } = req.params
    if (!rutaFile) {
      res.status(400).json({ message: 'El parametro rutaFile es obligatorio' })
    }

    try {
      // const rutaDoc = path.join(process.env.FILESPATH, rutaFile)
      await fs.access(rutaFile)
      //DESCARGANDO ARCHIVO EN EL CLIENTE
      res.dowload(rutaFile, (err) => {
        if (err) {
          console.error('Error al descargar el archivo:', err)
          res.status(500).json({ error: 'Error al descargar el archivo' })
        }
      })
    } catch (err) {
      console.error('❌ Error al enviar el archivo:', err)
      res.status(500).json({ error: 'Error al enviar el archivo' })
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
      console.log(usuariosParaAgregar)
      console.log(usuariosParaEliminar)

      if (usuariosParaAgregar.length > 0) {
        for (const usuario of usuariosParaAgregar) {
          // Asigna los usuarios a la etapac
          const resultado = await etapas.asingarUsuario({
            EtapaId,
            Usuario: usuario.Usuario
          })
          resultados.push(resultado)
        }
      }

      if (usuariosParaEliminar.length > 0) {
        for (const usuario of usuariosParaEliminar) {
          // Elimina los usuarios de la etapa
          const resultado = await etapas.deleteUsuarioDeEtapa({
            EtapaId,
            Usuario: usuario.Usuario
          })
          resultados.push(resultado)
        }
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
      //CREA UN NUEVO REGISTRO
      const resInsert = await etapas.iniciarEtapa({
        EtapaId,
        Usuario,
        DesarrolloProductoId,
        Estado: 3,
        DescripcionEstado: 'Iniciado'
      })

      // ACTUALIZA EL ESTADO DE LA ETAPA ASIGNADA
      const resUpdate = await etapas.actualizarEstadoAsignacion({
        DesarrolloProductoId,
        EtapaId
      })

      // ENVIAR NOTIFICACION DE INICIO DE ETAPA
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

  //MANEJO DE ARCHIVOS
  //INSERTA UN REGISTRO EN IND_PROGRESO_ETAPAS_HISTORIAL
  agregarActualizacion = async (req, res) => {
    const {
      ProgresoEtapaId,
      Descripcion,
      Estado,
      EstadoDescripcion,
      DesarrolloProductoId,
      EtapaId,
      Rechazos
    } = req.body
    if (
      !ProgresoEtapaId ||
      !Estado ||
      !EstadoDescripcion ||
      !DesarrolloProductoId ||
      !EtapaId
    ) {
      res.status(400).json({
        mensaje:
          'ProgresoEtapaId, Estado, EstadoDescripcion, DesarrolloProductoId y EtapaId son obligatorios'
      })
      return
    }

    try {
      //GUARDA EL ARCHIVO SI EXISTE EN EL FORMULARIO
      let rutaFile
      if (req.file) {
        const file = req.file
        const body = req.body
        rutaFile = await saveFile(file, body)
      }

      const response = await etapas.agregarActualizacion({
        ProgresoEtapaId,
        Estado,
        Descripcion,
        RutaDoc: rutaFile || null
      })

      // TABLA DE ASIGNACION DE ETAPAS
      const actualizacionAsignacion = await etapas.actualizarEstadoAsignacion({
        DesarrolloProductoId,
        EtapaId,
        Estado
      })

      //Si el usuario rechaza una etapa se suma 1 a rechazos del producto y cambia el estado a 2
      if (Estado == 2) {
        const updates = {
          rechazos: Rechazos,
          estado: Estado
        }
        const productoActualizacion = await producto.update({
          DesarrolloProductoId,
          updates
        })

        console.log(productoActualizacion)
      }

      // console.log(Estado = 1 o 2)
      if (Estado != 3) {
        const actualizacionProgreso = await etapas.actualizarProgresoEtapa({
          Estado,
          ProgresoEtapaId,
          EstadoDescripcion
        })

        //Notificacion de Aprobacion y Rechazo
        const resEnviarNotificacion = await sendNotificacion({
          DesarrolloProductoId,
          EtapaId
        })

        //Enviar notificacion de etapas siguientes si se aprobo la etapa
        console.log('Estado...', Estado)
        if (Estado == 1) {
          await notificacionSiguientesEtapas({
            DesarrolloProductoId,
            EtapaId
          })
        }

        res.status(200).json({
          mensaje: 'Actualizacion agregada con exito',
          response: response,
          actualizacionProgreso: actualizacionProgreso,
          actualizacionAsignacion: actualizacionAsignacion,
          resEnviarNotificacion: resEnviarNotificacion
        })

        return
      }

      console.log('Actualizacion del progreso ingresada...')
      res.status(200).json({
        mensaje: 'Actualizacion agregada con exito',
        response: response,
        actualizacionAsignacion: actualizacionAsignacion
      })
    } catch (err) {
      console.error('❌ Error al insert una actualizacion:', err)
      res.status(500).json({ error: 'Error en insertar una actualizacion' })
    }
  }

  //REASIGNAR ETAPAS SELECCIONADAS CAMBIANDO EL CORRELATIVO EN LOS ACTUALES
  reasignarEtapas = async (req, res) => {
    try {
      const { DesarrolloProductoId, Etapas, Correlativo } = req.body
      console.log(DesarrolloProductoId, Etapas, Correlativo)

      if (!DesarrolloProductoId || !Etapas) {
        res.status(400).json({
          mensaje: 'DesarrolloProductoId y Etapas son obligatorios'
        })
        return
      }

      const reasignaciones = Etapas.map(async (etapa) => {
        //ACTUALIZAR EL CORRELATIVO DE LAS ETAPAS ASIGNADAS
        console.log('EtapasAsignadasId -->', etapa?.EtapasAsignadasId)
        const resActualizacionAsignacion = await etapas.actualizarCorrelativo({
          EtapasAsignadasId: etapa?.EtapasAsignadasId,
          Correlativo: Correlativo
        })

        //ACTUALIZAR EL CORRELATIVO DEL PROGRESO DE LAS ETAPAS
        const actualizarCorrelativoProgreso =
          await etapas.actualizarProgresoEtapa({
            ProgresoEtapaId: etapa?.progresoEtapa[0]?.ProgresoEtapaId,
            Correlativo: Correlativo,
            Estado: etapa?.progresoEtapa[0]?.Estado,
            EstadoDescripcion: etapa?.progresoEtapa[0]?.DescripcionEstado
          })

        //INSERTAR NUEVAS ETAPAS EN ETAPAS ASIGNADAS CON ESTADO NULL Y CORRELATIVO NULL
        const asignacionesNuevas = await producto.asingarEtapa({
          desarrolloProducto: DesarrolloProductoId,
          EtapaId: etapa?.EtapaId
        })

        return {
          mensaje: 'Actualizacion de etapas aprobadas...',
          productoActualizado: resActualizacionAsignacion,
          etapasAsignadasNuevas: asignacionesNuevas,
          progresoEtapa: actualizarCorrelativoProgreso
        }
      })

      //ACTUALIZAR EL ESTADO DEL PRODUCTO A 3 - INICIADO
      const actualizarProducto = await producto.update({
        DesarrolloProductoId: DesarrolloProductoId,
        updates: {
          estado: 3
        }
      })

      const response = await Promise.all(reasignaciones)
      // const actualizacionRes = await Promise.all(actualizarProgresoEtapa)
      console.log('Actualizaciones:', response, actualizarProducto)

      // ENVIAR NOTIFICACIONES AL REASIGNAR ETAPAS
      await notificacionSiguientesEtapas({ DesarrolloProductoId, EtapaId: 1 })

      res.status(200).json({
        mensaje: 'Actualizacion de etapas aprobadas...',
        productoActualizado: actualizarProducto,
        response: response
      })
    } catch (err) {
      console.error('❌Error al actualizar el estado de las etapas:', err)
      res.status(500).json({ error: 'Error actualizar el estado' })
    }
  }

  //-------------------------
  //  DELETE
  //-------------------------
  deleteHistorialEtapa = async (req, res) => {
    const { ProEtapaHistorialId } = req.body
    console.log(ProEtapaHistorialId)
    if (!ProEtapaHistorialId) {
      res.status(400).json({
        mensaje: 'El ProgresoEtapaId es obligatorio para eliminar el registro'
      })
      return
    }

    try {
      const response = await etapas.deleteEtapaHistorial({
        ProEtapaHistorialId
      })
      res.status(200).json({
        mensaje: 'Registro eliminado correctamente...',
        response: response
      })
    } catch (err) {
      console.error('❌ Error al eliminar el registro:', err)
      res.status(500).json({ error: 'Error al eliminar el registro' })
    }
  }
}
