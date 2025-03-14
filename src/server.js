import express from 'express'
import { productoRouter } from './routes/producto.js'
import { etapaRouter } from './routes/etapa.js'
import process from 'node:process'
import cors from 'cors'
// import { internalIpV4 } from 'internal-ip'

const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(cors())
app.use('/', productoRouter())
app.use('/', etapaRouter())

const PORT = process.env.PORT || 3000

// app.listen(PORT, () => {
//   console.log(`Server listening on port http://localhost:${PORT}`)
// })

;(async () => {
  // const ip = await internalIpV4() // Obtiene tu IP local automáticamente
  const ip = '10.10.1.149' // IP local
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor local: http://localhost:${PORT}`)
    console.log(`Acceso desde la red: http://${ip}:${PORT}`)
  })
})()
