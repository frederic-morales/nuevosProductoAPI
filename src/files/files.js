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

// Recibe el archivo y el body del formulario
// Guarda el archivo en la ruta especificada y devuelve la ruta del archivo guardado
export const saveFile = async (file, body) => {
  console.log('Body....', body)
  const { NombreEtapa, NombreProducto } = body

  console.log('NombreProducto...', NombreProducto)
  console.log('NombreEtapa...', NombreEtapa)

  const rutaFolder = path.join(
    process.env.FILESPATH,
    limpiarNombres(NombreProducto),
    limpiarNombres(NombreEtapa)
  )

  await fs.mkdir(rutaFolder, { recursive: true })
  console.log('Creando la carpeta...', rutaFolder)
  const rutaFile = path.join(rutaFolder, file?.originalname)
  await fs.writeFile(rutaFile, file?.buffer)
  console.log('Guardando el archivo...', rutaFile)
  return rutaFile
}

const limpiarNombres = (nombre) => {
  return nombre
    .replace(/\/\*.*?\*\//g, '') // Elimina comentarios
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ' ') // Reemplaza caracteres especiales
    .replace(/\s+/g, ' ') // Espacios múltiples a uno solo
    .trim() // Elimina espacios al inicio/fin
}

export const deleteFile = async (filePath) => {
  try {
    await fs.access(filePath)
    await fs.unlink(filePath)
    console.log('Archivo eliminado:', filePath)
  } catch (err) {
    console.error('Error al eliminar el archivo:', err)
  }
}
