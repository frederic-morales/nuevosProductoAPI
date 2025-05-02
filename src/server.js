import express from 'express'
import { producto_router } from './routes/producto.js'
import { etapa_router } from './routes/etapa.js'
import { usuario_router } from './routes/usuarios.js'
import process from 'node:process'
import cors from 'cors'
//MIDDLEWARES
import { verifyToken } from './middlewares/verifyToken.js'
const app = express()
app.disable('x-powered-by')
app.use(express.json())
app.use(cors())

app.use(verifyToken) // Middleware para verificar el token JWT

//RUTAS
app.use('/', producto_router())
app.use('/', etapa_router())
app.use('/', usuario_router())

const PORT = process.env.PORT || 3000

;(async () => {
  const ip = process.env.IP // IP local - DESERROLLADOR2
  // const ip = process.env.IP_SERVER // IP DEL SERVIDOR
  app.listen(PORT, '0.0.0.0', () => {
    // 0.0.0.0 PERMITE EL ACCESO DESDE CUALQUIER IP DENTRO DE LA RED LOCAL
    console.log(`Servidor local: http://localhost:${PORT}`)
    console.log(`Acceso desde la red: http://${ip}:${PORT}`)
  })
})()
