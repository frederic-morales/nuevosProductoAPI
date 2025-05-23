import jwt from 'jsonwebtoken'
import process from 'process'
import { config } from 'dotenv'
config()

// Este token se genera en el login y se envía al cliente para que lo almacene y lo envíe en cada petición
// El middleware verifica el token en cada petición y permite o deniega el acceso a las rutas protegidas
// Para que solo los usuarios autenticados puedan acceder a ciertas rutas
export const verifyToken = async (req, res, next) => {
  const whiteList = ['/usuarios/verificacion'] // Rutas que no requieren token -- LOGIN
  if (whiteList.includes(req.path)) return next()
  const header = req.header('Authorization')
  const token = header && header.split(' ')[1]
  if (!token) {
    console.log('No se proporcionó un token en la cabecera de autorización')
    return res.status(401).json({ message: 'No se proporcionó un token' })
  }
  console.log('Token recibido:', token)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('Decoded:', decoded)
    if (!decoded) {
      console.log('Token inválido o expirado')
      return res.status(403).json({ mensaje: 'Token inválido o expirado' })
    }
    req.user = decoded // ← aquí guardas el payload, información del usuario
    console.log('Token verificado correctamente')
    next()
  } catch (err) {
    console.log('Error al verificar el token:', err)
  }
}
