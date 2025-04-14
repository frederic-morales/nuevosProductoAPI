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
  const mailOptions = {
    from: processs.env.MAILSENDER,
    to: `${mails}`,
    subject: 'Enviando correo de prueba',
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

export const sendNotificacion = async ({ DesarrolloProductoId, EtapaId }) => {
  const etapaUsuario = await notificacionesSQL.getEtapaUsuario({
    DesarrolloProductoId,
    EtapaId
  })

  if (etapaUsuario) {
    const mails = etapaUsuario?.Correo
    const hmtl = await mailHtml(etapaUsuario)
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
  // console.log(etapasANotificar)
  const etapasANotificar = await Promise.all(notificarEtapas)

  etapasANotificar.forEach(async (etapa) => {
    if (etapa?.PermitirInicio) {
      const mails = await etapa?.Correo
      const html = mailHtmlEtapaSiguiente(etapa)
      return await sendMail(mails, html)
    }
  })
}
