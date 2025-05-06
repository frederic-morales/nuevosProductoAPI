const mailHtml = (
  etapaInfo,
  esInicio,
  usuariosEtapa,
  UsuarioAccion,
  Descripcion,
  Estado
) => {
  console.log(etapaInfo)
  console.log(Estado)

  // Obtener la fecha actual
  // const hoy = new Date()
  // const opciones = { day: '2-digit', month: 'long', year: 'numeric' }
  // const fechaFormateada = hoy.toLocaleDateString('es-ES', opciones)

  const sumarDiasFecha = (dias) => {
    const hoy = new Date()
    hoy.setDate(hoy.getDate() + dias)
    const opciones = { day: '2-digit', month: 'long', year: 'numeric' }
    return hoy.toLocaleDateString('es-ES', opciones)
  }

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
        <p>Se acaba de realizar la siguiente accion: <b></b></p>
        ${
          esInicio
            ? `<p class="etapaIniciada">Etapa Iniciada <br> ${
                etapaInfo?.NombreEtapa
              }</p>
              <p><b>Fecha Inicio:</b> El ${sumarDiasFecha(0)}<br>
              <b>Fecha estimada a culminar:</b> El ${sumarDiasFecha(
                etapaInfo?.TiempoEstimado
              )}</p>
            `
            : ''
        }
          ${
            Estado == 3
              ? `<p class="etapaIniciada">Etapa Actualizada <br> ${etapaInfo?.NombreEtapa}</p>`
              : ''
          }
          ${
            Estado == 2
              ? `<p class="etapaIniciada">Etapa Rechazada <br> ${etapaInfo?.NombreEtapa}</p>`
              : ''
          }
          ${
            Estado == 1
              ? `<p class="etapaIniciada">Etapa Aprobada <br> ${etapaInfo?.NombreEtapa}</p>`
              : ''
          }
        <p>Detalles:</p>
        <ul>
        ${!esInicio ? `<li><b>Fecha:</b> El ${sumarDiasFecha(0)}` : ''}</li>
        <li><b>Usuario que realizó la acción:</b> ${UsuarioAccion}</li>
        <li><b>Responsable del desarrollo:</b> ${etapaInfo?.Nombres} ${
    etapaInfo?.Apellidos
  } </li>
        <li><b>Responsables de la Etapa:</b> ${usuariosEtapa} </li>
        ${!esInicio ? `<li><b>Descripcion:</b> ${Descripcion}</li>` : ''}
        </ul>
        <p>Puedes ver más detalles accediendo al sistema</p>
        <a href="http://10.10.1.4:3075/Login" class="button">Productos Nuevos</a>
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
