import multer from 'multer'
import fs from 'fs/promises'
import path from 'path'
import { config } from 'dotenv'
import process from 'process'

config()

export const uploadFile = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 10 * 1024 * 1024 } // 10MB
})

export const saveFile = async (file, body) => {
  console.log('Body....', body)
  const { NombreEtapa, NombreProducto } = body

  const rutaFolder = path.join(
    process.env.FILESPATH,
    NombreProducto,
    NombreEtapa
  )
  await fs.mkdir(rutaFolder, { recursive: true })
  console.log('Creando la carpeta...', rutaFolder)

  const rutaFile = path.join(rutaFolder, file?.originalname)
  await fs.writeFile(rutaFile, file?.buffer)
  console.log('Creando guardando el archivo...', rutaFile)
  return rutaFile
}
