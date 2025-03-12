import express from 'express'
import { productoRouter } from './routes/producto.js'
import { etapaRouter } from './routes/etapa.js'
import process from 'node:process'
const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use('/', productoRouter())
app.use('/', etapaRouter())

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`)
})
