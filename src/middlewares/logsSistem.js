// import { poolPromise } from "../sql/configDB"

export const logsSistem = async (req, res, next) => {
  try {
    // const pool = poolPromise
    const usuario = req?.user?.Usuario || 'SISTEMA'
    const ip = req?.ip || req?.connection?.remoteAddress

    console.log('IP:', ip)
    console.log('Usuario:', usuario)
    console.log('Guardando log...')
    next()
  } catch (err) {
    console.log('Error en el middleware de logs:', err)
  }
}
