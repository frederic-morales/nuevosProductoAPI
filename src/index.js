import express from 'express'
const app = express()

app.get('/', (req, res) => {
  res.send('Get!!')
})

app.listen(3000, () => {
  console.log('Server listening on port http://localhost:3000')
})
