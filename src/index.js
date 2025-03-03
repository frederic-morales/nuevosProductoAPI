import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('Get!!')
})

app.listen(4000, () => {
  console.log('Hola')
})
