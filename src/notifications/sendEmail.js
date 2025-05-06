import transporter from './mailConfig.js'
// import mailHtmlSiguiente from './htmlMailSiguiente.js'
import { config } from 'dotenv'
import processs from 'node:process'
import mailHtml from './htmlMail.js'
import mailHtmlEtapaSiguiente from './htmlMailSiguiente.js'

import { Notificaciones_sql } from '../sql/notificaciones.js'
import { Etapas_sql } from '../sql/etapas.js'
const notificacionesSQL = new Notificaciones_sql()
const etapasSQL = new Etapas_sql()

config()

const sendMail = async (mails, html) => {
  console.log('mails:', mails)
  const mailOptions = {
    from: processs.env.MAILSENDER,
    to: `${mails}`,
    subject: 'CORREO DE PRUEBA - IGNORAR',
    html: `${html}`
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error al enviar el correo:', error)
      return 'Error al enviar el correo:', error
    } else {
      console.log('Correo enviado: ', info.response)
      return 'Correo enviado: ', info.response
    }
  })
}

export const sendNotificacion = async ({
  DesarrolloProductoId,
  EtapaId,
  esInicio,
  UsuarioAccion,
  Descripcion,
  Estado
}) => {
  const etapaUsuario = await notificacionesSQL.getEtapaUsuario({
    DesarrolloProductoId,
    EtapaId
  }) // INFORMACION DE LA ETAPA Y EL USUARIO RESPONSABLE

  const mailsEtapa = await notificacionesSQL.getCorreosEtapa({
    DesarrolloProductoId,
    EtapaId
  }) // CORREOS DE LOS USUARIOS DE LA ETAPA

  const mailsGrupo = await notificacionesSQL.getCorrreosGrupo({
    CodigoGrupo: 69
  }) // CORREOS DE LOS USUARIOS DEL GRUPO 69 - GERENTE_ID

  // console.log('Correo responsable del producto:', etapaUsuario?.Correo)
  // console.log('Correos de la etapa:', mailsEtapa)
  // console.log('Correos del grupo:', mailsGrupo)
  // console.log(etapaUsuario?.Correo, mailsEtapa, mailsGrupo)
  // UNIENDO LOS CORREOS DE LOS USUARIOS DE LA ETAPA Y DEL GRUPO

  const mails =
    etapaUsuario?.Correo +
    ',' +
    mailsEtapa?.map((mail) => mail.Correo).join(',') +
    ',' +
    mailsGrupo?.map((mail) => mail.Correo).join(',')

  const usuariosEtapa = mailsEtapa
    ?.map((mail) => mail.Nombres + ' ' + mail.Apellidos)
    .join(', ')

  console.log(mails)

  if (etapaUsuario && mailsEtapa && mailsGrupo) {
    const hmtl = await mailHtml(
      etapaUsuario,
      esInicio,
      usuariosEtapa,
      UsuarioAccion,
      Descripcion,
      Estado
    )
    // return await sendMail('desarrollador2@wellcopharma.com', hmtl)
    return await sendMail(mails, hmtl)
  }
}

export const notificacionSiguientesEtapas = async ({
  DesarrolloProductoId,
  EtapaId
}) => {
  const etapasSiguientes = await notificacionesSQL.getEtapasSiguientes({
    DesarrolloProductoId,
    EtapaId
  })

  const notificarEtapas = etapasSiguientes.map(async (etapa) => {
    const EtapaId = etapa?.EtapaId
    const permitirInicio = await etapasSQL.verificarDependencias({
      DesarrolloProductoId,
      EtapaId
    })

    return {
      ...etapa,
      PermitirInicio: permitirInicio
    }
  })

  // console.log(etapasANotificar)
  const etapasANotificar = await Promise.all(notificarEtapas)
  etapasANotificar.forEach(async (etapa) => {
    if (etapa?.PermitirInicio) {
      // console.log('Etapa a iniciar:', etapa)
      const mailsEtapa = await notificacionesSQL.getCorreosEtapa({
        DesarrolloProductoId,
        EtapaId: etapa?.EtapaId
      }) // CORREOS DE LOS USUARIOS DE LA ETAPA
      const mailsGrupo = await notificacionesSQL.getCorrreosGrupo({
        CodigoGrupo: 69
      }) // CORREOS DE LOS USUARIOS DEL GRUPO 69 - GERENTE_ID
      // console.log('Etapas a Iniciar: ', etapa)
      // console.log('Correo responsable del producto:', etapa?.Correo)
      // console.log('Correos de la etapa:', mailsEtapa)
      // console.log('Correos del grupo:', mailsGrupo)
      const mails =
        etapa?.Correo +
        ',' +
        mailsEtapa?.map((mail) => mail.Correo).join(',') +
        ',' +
        mailsGrupo?.map((mail) => mail.Correo).join(',')

      const usuariosAIniciar = mailsEtapa
        ?.map((mail) => mail.Nombres + ' ' + mail.Apellidos)
        .join(', ')

      console.log(mails)
      // console.log('Usuarios a iniciar: ', mailsEtapa)

      const html = mailHtmlEtapaSiguiente(etapa, usuariosAIniciar)

      // return await sendMail('desarrollador2@wellcopharma.com', html)
      return await sendMail(mails, html)
    }
  })
}
