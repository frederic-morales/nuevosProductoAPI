import transporter from './mailConfig.js'

const sendMail = async (mails, text) => {
  const mailOptions = {
    from: 'info@wellcopharma.com',
    to: `${mails}`,
    subject: 'Enviando correo de prueba',
    text: 'Contenido del correo en texto plano',
    html: `<p>Contenido del correo en <b>HTML ${text}</b></p>`
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error al enviar el correo:', error)
    } else {
      console.log('Correo enviado: ' + info.response)
    }
  })
}

sendMail('desarrollador2@wellcopharma.com', 'Holaa')
