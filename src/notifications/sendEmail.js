import transporter from './mailConfig.js'
import mailHtml from './htmlMail.js'
import { config } from 'dotenv'
import processs from 'node:process'

config()

import { Etapas_sql } from '../sql/etapas.js'
const etapas = new Etapas_sql()

const sendMail = async (mails) => {
  const mailOptions = {
    from: processs.env.MAILSENDER,
    to: `${mails}, tocomorales30@gmail.com`,
    subject: 'Enviando correo de prueba',
    html: `${mailHtml()}`
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

// sendMail('desarrollador2@wellcopharma.com', 'Holaa')
const sendNotificacion = async ({ DesarrolloProductoId, EtapaId }) => {
  const etapaUsuario = await etapas.getEtapaUsuario({
    DesarrolloProductoId,
    EtapaId
  })

  console.log(etapaUsuario)
  const emails = await etapaUsuario?.Correo

  if (emails) {
    return await sendMail(emails)
  } else {
    console.log('Sin correo')
  }
}

export default sendNotificacion
