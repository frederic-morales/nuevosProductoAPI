const mailHtmlEtapaSiguiente = (etapaInfo) => {
  console.log(etapaInfo)

  // Obtener la fecha actual
  const hoy = new Date()
  const opciones = { day: '2-digit', month: 'long', year: 'numeric' }
  const fechaFormateada = hoy.toLocaleDateString('es-ES', opciones)

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
          font-size: 19px;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
          text-transform: uppercase;
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
          background: #000000;
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
        .etapaIniciada {
          font-weight: bold;
          color: #6495ED;
          text-align: center;
          text-transform: uppercase;
        }
        .etapaRechazada {
          font-weight: bold;
          color: "red";
          text-align: center;
          text-transform: uppercase;
        }
        .etapaAprobada {
          font-weight: bold;
          color: "green";
          text-align: center;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">🔔 Notificación para el producto 
        ${etapaInfo?.NombreProducto}
        </div>
        <div class="content">
          <p>Se requiere iniciar la siguiente etapa: <b></b></p>
          <p class="etapaIniciada">${etapaInfo?.NombreEtapa}</p>  
          <p>Detalles:</p>
          <ul>
          <li><b>Fecha a Iniciar:</b> El ${fechaFormateada}</li>
          <li><b>Usuario A Iniciar:</b> ${etapaInfo?.Usuario} </li>
          <li><b>Nombre:</b> ${etapaInfo?.Nombres} ${etapaInfo?.Apellidos}</li>
          </ul>
          <p>Puedes ver más detalles accediendo al sistema</p>
          <a href="http://localhost:5173/Producto/All" class="button">Productos Nuevos</a>
        </div>
        <div class="footer">
          © 2025 Wellco Corporation. Departamento de tecnología.
        </div>
      </div>
    </body>
  </html>
      `
}
export default mailHtmlEtapaSiguiente
