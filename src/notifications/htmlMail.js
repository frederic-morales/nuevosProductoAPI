const mailHtml = () => {
  const mensaje = 'holaaa'

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Notificación</title>
    <style>
      /* Estilos embebidos compatibles con la mayoría de los clientes de correo */
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #ffffff;
        color: Black;
        text-align: center;
        font-weight: Bold;
        padding: 15px;
        font-size: 24px;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
      }
      .content {
        padding: 20px;
        font-size: 16px;
        color: #333;
        line-height: 1.6;
      }
      .button {
        display: block;
        width: 200px;
        margin: 20px auto;
        padding: 10px;
        background: #ffffff;
        color: white;
        text-align: center;
        text-decoration: none;
        font-size: 18px;
        border-radius: 5px;
      }
      .button:hover {
        background: #ffffff;
      }
      .footer {
        text-align: center;
        padding: 15px;
        font-size: 14px;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">🔔 Notificación Importante</div>
      <div class="content">
        <p>Hola <b>Se acaba de realizar la siguiente accion para el Producto ${'Producto1'}</b>,</p>
        <p>
          ${'Aprobacion de la etapa1'} 
        </p>
        <p>Detalles:</p>
        <ul>
          <li><b>Fecha:</b> El ${'01 04 2025'}</li>
          <li><b>Mensaje:</b> ${mensaje}</li>
        </ul>
        <p>Puedes ver más detalles accediendo al sistema.</p>
        <a href="google.com" class="button">Ver Notificación</a>
      </div>
      <div class="footer">
        © 2025 Wellco Corporation. Departamento de tecnología.
      </div>
    </div>
  </body>
</html>
    `
}
export default mailHtml
