import { Etapas_sql } from '../sql/etapas.js'
import { NuevoProducto } from '../sql/producto.js'
import {
  sendNotificacion,
  notificacionSiguientesEtapas
} from '../notifications/sendEmail.js'
import fs from 'fs/promises'
// import fsExists from 'fs.promises.exists'
import { saveFile, deleteFile } from '../files/files.js'
// import path from 'path'
import process from 'process'
import insertLog from '../sql/logs.js'
const etapas = new Etapas_sql()
const producto = new NuevoProducto()

export class Etapa {
  //-------------------------
  //  GETS
  //-------------------------
  server = async (req, res) => {
    res.status(200).json({ message: 'Server running - etapa' })
  }

  //TRAE LA INFORMACION DE UNA ETAPA
  getInfo = async (req, res) => {
    const EtapaId = req.params.etapaId
    console.log(EtapaId)
    if (!EtapaId) {
      res.status(400).json({ message: 'El EtapaId es obligatorio' })
      return
    }
    try {
      const etapaInfo = await etapas.getInfo({ EtapaId })
      if (!etapaInfo) {
        res.status(404).json({ message: 'Etapa no encontrada' })
        return
      }
      console.log(etapaInfo)
      res.status(200).json(etapaInfo)
      // console.log(etapaInfo)
    } catch (err) {
      console.error('❌ Error al obtener la informacion de la etapa:', err)
      res.status(500).json({ error: 'Error en la obtención de la etapa' })
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

      // INSERTAR LOG
      await insertLog({
        NombreTabla: 'IND_ETAPAS',
        TipoOperacion: 'SELECT',
        Descripcion: `CONSULTA DE TODAS LAS ETAPAS - MENU ACTUALIZACIÓN DE ETAPAS`,
        UsuarioApp: req?.user?.Usuario, // Usuario que inicio sesion
        IpOrigen: req.ip,
        IdEvento: 4
      })
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

      // console.log(infoEtapa)
      res.status(200).json({ infoEtapa })
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
      // INSERTAR LOG
      await insertLog({
        NombreTabla: 'IND_PROGRESO_ETAPAS',
        TipoOperacion: 'SELECT',
        Descripcion: `CONSULTA DEL HISTORIAL DE LA ETAPA ${EtapaId} DEL PRODUCTO ${DesarrolloProductoId}`,
        UsuarioApp: req?.user?.Usuario, // Usuario que inicio sesion
        IpOrigen: req.ip,
        IdEvento: 4
      })
    } catch (err) {
      console.error('❌ Error al obtener el historial de la etapa:', err)
      res.status(500).json({ error: 'Error al obtener el historial' })
    }
  }

  // TRAE EL ARCHIVO DE PROGRESO
  getFileProgreso = async (req, res) => {
    const { nombreProducto, nombreEtapa, archivo } = req.params
    if (!nombreProducto || !nombreEtapa || !archivo) {
      res.status(400).json({ message: 'El parametro rutaFile es obligatorio' })
    }
    try {
      // VERIFICA SI EL ARCHIVO EXISTE EN LA RUTA
      // const archivo = '..\\archivos'
      // const rutaFile = `${process.env.FILESPATH}\\${nombreProducto}\\${nombreEtapa}\\${archivo}`
      const rutaFile = `archivos\\${nombreProducto}\\${nombreEtapa}\\${archivo}`
      console.log('rutaFile...', rutaFile)
      await fs.access(rutaFile)

      //DESCARGANDO ARCHIVO EN EL CLIENTE
      res.download(rutaFile, (err) => {
        if (err) {
          console.error('Error al descargar el archivo:', err)
          res.status(500).json({ error: 'Error al descargar el archivo' })
        }
      })

      // INSERTAR LOG
      await insertLog({
        NombreTabla: 'IND_PROGRESO_ETAPAS_HISTORIAL',
        TipoOperacion: 'SELECT',
        Descripcion: `DESCARGANDO ARCHIVO ${archivo} DE LA ETAPA ${nombreEtapa} DEL PRODUCTO ${nombreProducto}`,
        UsuarioApp: req?.user?.Usuario, // Usuario que inicio sesion
        IpOrigen: req.ip,
        IdEvento: 4
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

      //INSERTAR LOG
      await insertLog({
        NombreTabla: 'IND_GRUPOS_USUARIOS_ETAPAS',
        TipoOperacion: 'UPDATE',
        Descripcion: `SE HAN ACTUALIZADO LOS USUARIOS DE LA ETAPA ${EtapaId} -- USUARIOS ELIMINADOS: ${usuariosParaEliminar.map(
          (e) => `${e?.Usuario}`
        )} -- USUARIOS ASIGNADOS: ${usuariosParaAgregar.map(
          (e) => `${e?.Usuario}`
        )}`,
        UsuarioApp: req?.user?.Usuario, // Usuario que inicio sesion
        IpOrigen: req.ip,
        IdEvento: 6
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

      // console.log('-----------Mostrando usuario----------')
      // console.log(req?.user)
      // ENVIAR NOTIFICACION DE INICIO DE ETAPA
      const resEnviarNotificacion = await sendNotificacion({
        DesarrolloProductoId,
        EtapaId,
        esInicio: true,
        Estado: 0,
        UsuarioAccion: req?.user?.Nombres + ' ' + req?.user?.Apellidos // USUARIO CON SESION INCIADA
      })

      res.status(200).json({
        mensaje: 'Etapa Inciada exitosamente...',
        resultInsert: resInsert,
        resultUpdate: resUpdate,
        resEnviarNotificacion: resEnviarNotificacion
      })

      //INSERTAR LOG
      await insertLog({
        NombreTabla: 'IND_PROGRESO_ETAPAS',
        TipoOperacion: 'INSERT',
        Descripcion: `SE HA INICIADO LA ETAPA ${EtapaId} PARA EL PRODUCTO ${DesarrolloProductoId}`,
        UsuarioApp: req?.user?.Usuario, // Usuario que inicio sesion
        IpOrigen: req.ip,
        IdEvento: 5
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
      Rechazos,
      Usuario
    } = req.body
    if (
      !ProgresoEtapaId ||
      !Estado ||
      !EstadoDescripcion ||
      !DesarrolloProductoId ||
      !EtapaId ||
      !Usuario
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
        RutaDoc: rutaFile || null,
        Usuario
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
        await producto.update({
          DesarrolloProductoId,
          updates
        })

        // console.log(productoActualizacion)
      }

      // console.log(Estado = 1 o 2)

      if (Estado != 3) {
        // console.log('-------------- ESTADO ---------------')
        // console.log(Estado)
        // console.log(EstadoDescripcion)
        const actualizacionProgreso = await etapas.actualizarProgresoEtapa({
          Estado,
          ProgresoEtapaId,
          EstadoDescripcion
        })

        await sendNotificacion({
          DesarrolloProductoId,
          EtapaId,
          Descripcion,
          esInicio: false,
          Estado,
          UsuarioAccion: req?.user?.Nombres + ' ' + req?.user?.Apellidos // USUARIO CON SESION INCIADA
        })

        //Enviar notificacion de etapas siguientes si se aprobo la etapa
        console.log('Estado...', Estado)
        if (Estado == 1) {
          // SP VERIFICA SI SE PUEDE APROBAR EL PPRODUCTO
          await producto.aprobarProducto({ DesarrolloProductoId })

          // ENVIAR NOTIFICACION DE INICIO DE ETAPA
          await notificacionSiguientesEtapas({
            DesarrolloProductoId,
            EtapaId
          })
        }

        res.status(200).json({
          mensaje: 'Actualizacion agregada con exito',
          response: response,
          actualizacionProgreso: actualizacionProgreso,
          actualizacionAsignacion: actualizacionAsignacion
        })

        //INSERTAR LOG
        await insertLog({
          NombreTabla: 'IND_PROGRESO_ETAPAS_HISTORIAL, IND_PROGRESO_ETAPAS',
          TipoOperacion: 'UPDATE',
          Descripcion: `SE HA ${
            Estado == 1 ? 'APROBADO' : 'RECHAZADO'
          } LA ETAPA ${EtapaId} DEL PRODUCTO ${DesarrolloProductoId} ${
            req.file ? 'CON ARCHIVO' : 'SIN ARCHIVO'
          }`,
          UsuarioApp: req?.user?.Usuario, // Usuario que inicio sesion
          IpOrigen: req.ip,
          IdEvento: `${Estado == 1 ? 12 : 13}`
        })
        return
      }
      //ENVIAR NOTIFICACION DE ETAPA
      // console.log('-----------Mostrando usuario----------')
      // console.log(req?.user)
      //Notificacion de Aprobacion, Rechazo y Actualización
      await sendNotificacion({
        DesarrolloProductoId,
        EtapaId,
        Estado,
        Descripcion,
        esInicio: false,
        UsuarioAccion: req?.user?.Nombres + ' ' + req?.user?.Apellidos // USUARIO CON SESION INCIADA
      })

      console.log('Actualizacion del progreso ingresada...')
      res.status(200).json({
        mensaje: 'Actualizacion agregada con exito',
        response: response,
        actualizacionAsignacion: actualizacionAsignacion
      })

      //INSERTAR LOG
      await insertLog({
        NombreTabla: 'IND_PROGRESO_ETAPAS_HISTORIAL, IND_PROGRESO_ETAPAS',
        TipoOperacion: 'INSERT',
        Descripcion: `SE HA ACTUALIZADO EL PROGRESO DE LA ETAPA ${EtapaId} DEL PRODUCTO ${DesarrolloProductoId} - ${
          req.file ? 'CON ARCHIVO' : 'SIN ARCHIVO'
        }`,
        UsuarioApp: req?.user?.Usuario, // Usuario que inicio sesion
        IpOrigen: req.ip,
        IdEvento: 5
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
      console.log('Actualizaciones:', response, actualizarProducto)

      // ENVIAR NOTIFICACIONES AL REASIGNAR ETAPAS
      await notificacionSiguientesEtapas({ DesarrolloProductoId, EtapaId: 1 })

      res.status(200).json({
        mensaje: 'Actualizacion de etapas aprobadas...',
        productoActualizado: actualizarProducto,
        response: response
      })

      //INSERTAR LOG
      await insertLog({
        NombreTabla: 'IND_ETAPAS_ASIGNADAS',
        TipoOperacion: 'UPDATE',
        Descripcion: `REASIGNANDO LAS ETAPAS ${Etapas.map(
          (e) => `${e?.EtapaId}`
        )} PARA EL PRODUCTO ${DesarrolloProductoId}`,
        UsuarioApp: req?.user?.Usuario, // Usuario que inicio sesion
        IpOrigen: req.ip,
        IdEvento: 6
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
    const { ProEtapaHistorialId, NombreProducto, NombreEtapa, Archivo } =
      req.body
    console.log(ProEtapaHistorialId, NombreProducto, NombreEtapa, Archivo)
    if (!ProEtapaHistorialId) {
      res.status(400).json({
        mensaje: 'El ProgresoEtapaId es obligatorio para eliminar el registro'
      })
      return
    }

    try {
      console.log(ProEtapaHistorialId)
      const response = await etapas.deleteEtapaHistorial({
        ProEtapaHistorialId
      })

      //ELIMINA EL ARCHIVO DE LA RUTA
      const archivo = `${NombreProducto}\\${NombreEtapa}\\${Archivo}`
      console.log('Archivo...', archivo)
      if (NombreProducto && NombreEtapa && Archivo) {
        const rutaFile = `${process.env.FILESPATH}\\${archivo}`
        console.log('Eliminando el archivo...')
        console.log('rutaFile...', rutaFile)
        await deleteFile(rutaFile)
      }

      res.status(200).json({
        mensaje: 'Registro eliminado correctamente...',
        response: response
      })

      //INSERTAR LOG
      await insertLog({
        NombreTabla: 'IND_PROGRESO_ETAPAS_HISTORIAL',
        TipoOperacion: 'DELETE',
        Descripcion: `SE HA ELIMINADO UNA ACTUALIZACION PARA EL PROGRESO DE LA ETAPA ${ProEtapaHistorialId}`,
        UsuarioApp: req?.user?.Usuario, // Usuario que inicio sesion
        IpOrigen: req.ip,
        IdEvento: 7
      })
    } catch (err) {
      console.error('❌ Error al eliminar el registro:', err)
      res.status(500).json({ error: '❌ Error al eliminar el registro' })
    }
  }
}
