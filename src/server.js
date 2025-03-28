import express from 'express'
import { producto_router } from './routes/producto.js'
import { etapa_router } from './routes/etapa.js'
import { usuario_router } from './routes/usuarios.js'
import process from 'node:process'
import cors from 'cors'

const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(cors())
app.use('/', producto_router())
app.use('/', etapa_router())
app.use('/', usuario_router())

const PORT = process.env.PORT || 3000

;(async () => {
  const ip = process.env.IP // IP local
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor local: http://localhost:${PORT}`)
    console.log(`Acceso desde la red: http://${ip}:${PORT}`)
  })
})()
